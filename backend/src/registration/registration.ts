import Joi from "@hapi/joi"
import { SBConnection } from "@ladc/sql-bricks-modifier"
import { hash } from "bcrypt"
import { randomBytes } from "crypto"
import { Request, Response } from "express"
import { deleteFrom, insert, select } from "sql-bricks"
import { whyNewPasswordIsInvalid, whyUsernameIsInvalid } from "../../../shared/libraries/helpers"
import { BCRYPT_SALT_ROUNDS, TOKEN_LENGTH } from "../context"
import { sendMail } from "../mail"
import { hasAdminRights, SessionData } from "../session"
import { getCn } from "../utils/dbUtils"
import { validate } from "../utils/joiUtils"
import { log } from "../utils/log"
import { AuthorizationError, BackendContext, getTeamSiteUrl } from "../utils/serverUtils"
import { getAccountByLogin } from "../utils/userUtils"

let joiSchemata = {
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

export async function routeSendInvitation(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeSendInvitation'")

  let context = { subdomain }
  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("You are not allowed to send invitation mails")

  let cleanData = await validate(data, joiSchemata.routeSendInvitation)

  if (cleanData.username && whyUsernameIsInvalid(cleanData.username)) {
    return {
      done: false,
      reason: "Invalid username"
    }
  }

  let token = randomBytes(TOKEN_LENGTH).toString("hex")
  let tcn = await cn.beginTransaction()
  let answer = { done: false } as any

  try {
    let inv = await storeAndSendInvitation(context, tcn, token, cleanData.email, cleanData.validity, cleanData.username)

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

export async function routeResendInvitation(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeResendInvitation'")

  let context = { subdomain }
  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("You are not allowed to send invitation mails")

  let cleanData = await validate(data, joiSchemata.routeResendInvitation)

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

  let answer = { done: false } as any
  let token = randomBytes(TOKEN_LENGTH).toString("hex")
  let tcn = await cn.beginTransaction()

  try {
    await removeInvitationWithId(tcn, cleanData.invitationId)

    let inv = await storeAndSendInvitation(context, tcn, token, cleanData.email, cleanData.validity, cleanData.username)

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

export async function routeCancelInvitation(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeCancelInvitation'")

  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("You are not allowed to cancel invitations")

  let cleanData = await validate(data, joiSchemata.routeCancelInvitation)

  if (await existsInvitationWithId(cn, cleanData.invitationId))
    await removeInvitationWithId(cn, cleanData.invitationId)

  return {
    done: true
  }
}

export async function routeRegister(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  let cn = await getCn(subdomain)
  let cleanData = await validate(data, joiSchemata.routeRegister)

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

  let passwordHash = await hash(cleanData.password, BCRYPT_SALT_ROUNDS)
  let sql = insert("account", {
    "name": cleanData.name,
    "login": cleanData.login,
    "email": cleanData.email,
    password: passwordHash
  })

  let tcn = await cn.beginTransaction()

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

export async function routeGetPendingInvitations(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeGetPendingInvitations'")

  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("You are not allowed to do this")

  let arr = [] as any[]
  let sql = select().from("reg_new")
  let result = await cn.all(sql)

  for (let row of result)
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
    let inv = await storeInvitation(cn, token, email, validity, username)

    if (await sendInvitationMail(context, token, email, username))
      return Object.assign({}, inv, { username, email })
  } catch (error) {
    log.error("Could not store invitation", error.message)
  }

  return undefined
}

async function sendInvitationMail(context: BackendContext, token: string, to: string, username?: string) {
  let regUrl = `${getTeamSiteUrl(context)}/registration?action=registration&token=${encodeURIComponent(token)}`
  if (username)
    regUrl += `&username=${encodeURIComponent(username)}`

  let html = `Please click <a href="${regUrl.toString()}">here</a> to create your account.`
  let result = await sendMail({
    to,
    subject: "Create your account",
    html
  })

  if (!result.done)
    log.error(`Could not send invitation mail: ${result.errorMsg}`)

  return result.done
}

async function storeInvitation(cn: SBConnection, token: string, email: string, validity: number, username?: string) {
  let currentTs = Math.floor(Date.now())
  let expireTs = currentTs + validity * 24 * 3600 * 1000
  let sql = insert("reg_new", {
    "user_email": email,
    "token": token,
    "create_ts": currentTs,
    "expire_ts": expireTs
  })

  if (username && !await getAccountByLogin(cn, username))
    sql.values({ "user_name": username })

  let result = await cn.exec(sql)

  return {
    id: result.getInsertedIdAsString(),
    creationTs: currentTs,
    expirationTs: expireTs
  }
}

async function removeInvitationWithId(cn: SBConnection, id: string) {
  let sql = deleteFrom("reg_new").where({ "reg_new_id": id })

  await cn.exec(sql)
}

async function removeInvitationWithToken(cn: SBConnection, token: string) {
  let sql = deleteFrom("reg_new").where({ token })

  await cn.exec(sql)
}

async function existsInvitationWithToken(cn: SBConnection, token: string) {
  let sql = select().from("reg_new").where({ token })
  let row = await cn.singleRow(sql)

  return row ? true : false
}

async function existsInvitationWithId(cn: SBConnection, id: string) {
  let sql = select().from("reg_new").where({ "reg_new_id": id })
  let row = await cn.singleRow(sql)

  return row ? true : false
}
