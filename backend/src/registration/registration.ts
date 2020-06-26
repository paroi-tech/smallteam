import Joi from "@hapi/joi"
import { SBConnection } from "@ladc/sql-bricks-modifier"
import { hash } from "bcrypt"
import { randomBytes } from "crypto"
import { deleteFrom, insert, select } from "sql-bricks"
import { whyNewPasswordIsInvalid, whyUsernameIsInvalid } from "../../../shared/libraries/helpers"
import { appLog, BCRYPT_SALT_ROUNDS, TOKEN_LENGTH } from "../context"
import { sendMail } from "../mail"
import { hasAdminRights, SessionData } from "../session"
import { getCn } from "../utils/dbUtils"
import { validate } from "../utils/joiUtils"
import { AuthorizationError, BackendContext, getTeamSiteUrl } from "../utils/serverUtils"
import { getAccountByLogin } from "../utils/userUtils"

const joiSchemata = {
  routeSendInvitation: Joi.object().keys({
    username: Joi.string().trim().optional(),
    email: Joi.string().email().required(),
    validity: Joi.number().integer().min(1).max(30).required()
  }),

  routeResendInvitation: Joi.object().keys({
    invitationId: Joi.number().min(1).required(),
    email: Joi.string().email().required(),
    username: Joi.string().trim().optional(),
    validity: Joi.number().integer().min(1).max(30).required()
  }),

  routeCancelInvitation: Joi.object().keys({
    invitationId: Joi.number().min(1).required()
  }),

  routeRegister: Joi.object().keys({
    name: Joi.string().trim().min(1).required(),
    login: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    token: Joi.string().hex().length(TOKEN_LENGTH * 2).required()
  })
}

export async function routeSendInvitation(subdomain: string, data: any, sessionData?: SessionData) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeSendInvitation'")

  const context = { subdomain }
  const cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("You are not allowed to send invitation mails")

  const cleanData = await validate(data, joiSchemata.routeSendInvitation)

  if (cleanData.username && whyUsernameIsInvalid(cleanData.username)) {
    return {
      done: false,
      reason: "Invalid username"
    }
  }

  const token = randomBytes(TOKEN_LENGTH).toString("hex")
  const tcn = await cn.beginTransaction()
  const answer = { done: false } as any

  try {
    const inv = await storeAndSendInvitation(context, tcn, token, cleanData.email, cleanData.validity, cleanData.username)

    if (inv) {
      await tcn.commit()
      answer.invitation = inv
    }
  } finally {
    if (tcn.inTransaction)
      await tcn.rollback()
  }

  return answer
}

export async function routeResendInvitation(subdomain: string, data: any, sessionData?: SessionData) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeResendInvitation'")

  const context = { subdomain }
  const cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("You are not allowed to send invitation mails")

  const cleanData = await validate(data, joiSchemata.routeResendInvitation)

  if (cleanData.username && whyUsernameIsInvalid(cleanData.username)) {
    return {
      done: false,
      reason: "Invalid username"
    }
  }

  if (!existsInvitationWithId(cn, cleanData.invitationId)) {
    return {
      done: false,
      reason: "Invitation not found"
    }
  }

  const answer = { done: false } as any
  const token = randomBytes(TOKEN_LENGTH).toString("hex")
  const tcn = await cn.beginTransaction()

  try {
    await removeInvitationWithId(tcn, cleanData.invitationId)

    const inv = await storeAndSendInvitation(context, tcn, token, cleanData.email, cleanData.validity, cleanData.username)

    if (inv) {
      await tcn.commit()
      answer.invitation = inv
    }
  } finally {
    if (tcn.inTransaction)
      await tcn.rollback()
  }

  return answer
}

export async function routeCancelInvitation(subdomain: string, data: any, sessionData?: SessionData) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeCancelInvitation'")

  const cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("You are not allowed to cancel invitations")

  const cleanData = await validate(data, joiSchemata.routeCancelInvitation)

  if (await existsInvitationWithId(cn, cleanData.invitationId))
    await removeInvitationWithId(cn, cleanData.invitationId)

  return {
    done: true
  }
}

export async function routeRegister(subdomain: string, data: any) {
  const cn = await getCn(subdomain)
  const cleanData = await validate(data, joiSchemata.routeRegister)

  if (whyUsernameIsInvalid(cleanData.login)) {
    return {
      done: false,
      reason: "Invalid login"
    }
  }

  if (whyNewPasswordIsInvalid(cleanData.password)) {
    return {
      done: false,
      reason: "Invalid password"
    }
  }

  if (!await existsInvitationWithToken(cn, cleanData.token)) {
    return {
      done: false,
      reason: "Token not found"
    }
  }

  const passwordHash = await hash(cleanData.password, BCRYPT_SALT_ROUNDS)
  const sql = insert("account", {
    "name": cleanData.name,
    "login": cleanData.login,
    "email": cleanData.email,
    password: passwordHash
  })

  const tcn = await cn.beginTransaction()

  try {
    await tcn.exec(sql)
    await tcn.exec(deleteFrom("reg_new").where({ token: cleanData.token }))
    await tcn.commit()
  } finally {
    if (tcn.inTransaction)
      await tcn.rollback()
  }

  return {
    done: true
  }
}

export async function routeGetPendingInvitations(subdomain: string, data: any, sessionData?: SessionData) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeGetPendingInvitations'")

  const cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("You are not allowed to do this")

  const arr = [] as any[]
  const sql = select().from("reg_new")
  const result = await cn.all(sql)

  for (const row of result)
    arr.push(toInvitation(row))

  return {
    done: true,
    data: arr
  }
}

function toInvitation(row) {
  return {
    id: row["reg_new_id"],
    username: row["username"],
    email: row["user_email"],
    expirationTs: row["expire_ts"],
    creationTs: row["create_ts"]
  }
}

async function storeAndSendInvitation(context: BackendContext, cn: SBConnection, token: string, email: string, validity: number, username?: string) {
  try {
    const inv = await storeInvitation(cn, token, email, validity, username)

    if (await sendInvitationMail(context, token, email, username))
      return Object.assign({}, inv, { username, email })
  } catch (error) {
    appLog.error("Could not store invitation", error.message)
  }

  return undefined
}

async function sendInvitationMail(context: BackendContext, token: string, to: string, username?: string) {
  let regUrl = `${getTeamSiteUrl(context)}/registration?action=registration&token=${encodeURIComponent(token)}`
  if (username)
    regUrl += `&username=${encodeURIComponent(username)}`

  const html = `Please click <a href="${regUrl.toString()}">here</a> to create your account.`
  const result = await sendMail({
    to,
    subject: "Create your account",
    html
  })

  if (!result.done)
    appLog.error(`Could not send invitation mail: ${result.errorMsg}`)

  return result.done
}

async function storeInvitation(cn: SBConnection, token: string, email: string, validity: number, username?: string) {
  const currentTs = Math.floor(Date.now())
  const expireTs = currentTs + validity * 24 * 3600 * 1000
  const sql = insert("reg_new", {
    "user_email": email,
    "token": token,
    "create_ts": currentTs,
    "expire_ts": expireTs
  })

  if (username && !await getAccountByLogin(cn, username))
    sql.values({ "user_name": username })

  const result = await cn.exec(sql)

  return {
    id: result.getInsertedIdAsString(),
    creationTs: currentTs,
    expirationTs: expireTs
  }
}

async function removeInvitationWithId(cn: SBConnection, id: string) {
  const sql = deleteFrom("reg_new").where({ "reg_new_id": id })

  await cn.exec(sql)
}

// async function removeInvitationWithToken(cn: SBConnection, token: string) {
//   let sql = deleteFrom("reg_new").where({ token })
//   await cn.exec(sql)
// }

async function existsInvitationWithToken(cn: SBConnection, token: string) {
  const sql = select().from("reg_new").where({ token })
  const row = await cn.singleRow(sql)

  return row ? true : false
}

async function existsInvitationWithId(cn: SBConnection, id: string) {
  const sql = select().from("reg_new").where({ "reg_new_id": id })
  const row = await cn.singleRow(sql)

  return row ? true : false
}
