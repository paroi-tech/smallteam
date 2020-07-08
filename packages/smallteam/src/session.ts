import Joi from "@hapi/joi"
import { SBConnection } from "@ladc/sql-bricks-modifier"
import { whyNewPasswordIsInvalid } from "@smallteam/shared/dist/libraries/helpers"
import { compare, hash } from "bcrypt"
import { randomBytes } from "crypto"
import { Request } from "express"
import { IncomingMessage } from "http"
import { deleteFrom, insert, select, update } from "sql-bricks"
import { appLog, BCRYPT_SALT_ROUNDS, TOKEN_LENGTH } from "./context"
import { sendMail } from "./mail"
import { getCn } from "./utils/dbUtils"
import { validate } from "./utils/joiUtils"
import { AuthorizationError, BackendContext, getConfirmedSubdomain, getIncomingMessageSubdomain, getTeamSiteUrl } from "./utils/serverUtils"
import { getAccountByEmail, getAccountById, getAccountByLogin } from "./utils/userUtils"

const passwordResetTokenValidity = 3 * 24 * 3600 * 1000 /* 3 days */

export interface SessionData {
  accountId: string
  subdomain: string
}

interface PasswordUpdateInfo {
  accountId: string
  createTs: number
  token: string
}

const numberRegex = /^[1-9][0-9]*$/

const joiSchemata = {
  routeConnect: Joi.object().keys({
    login: Joi.string().trim().alphanum().required(),
    password: Joi.string().required()
  }),

  routeSetPassword: Joi.object().keys({
    accountId: Joi.string().regex(numberRegex).required(),
    password: Joi.string().required()
  }),

  routeChangePassword: Joi.object().keys({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required()
  }),

  routeResetPassword: Joi.object().keys({
    token: Joi.string().hex().length(2 * TOKEN_LENGTH).required(),
    password: Joi.string().required(),
    accountId: Joi.string().regex(numberRegex).required()
  }),

  routeSendPasswordEmail: Joi.object().keys({
    email: Joi.string().trim().email().required()
  })
}

export async function routeConnect(subdomain: string, data: any, sessionData?: SessionData, req?: Request) {
  if (!req)
    throw new Error("Request object missing 'routeConnect'")

  const cn = await getCn(subdomain)
  const cleanData = await validate(data, joiSchemata.routeConnect)
  const account = await getAccountByLogin(cn, cleanData.login)

  if (account && await compare(cleanData.password, account.password)) {
    req.session!.accountId = account.id
    req.session!.subdomain = subdomain

    return {
      done: true,
      accountId: account.id
    }
  }

  return {
    done: false
  }
}

export async function routeCurrentSession(subdomain: string, data: any, sessionData?: SessionData, req?: Request) {
  if (!req)
    throw new Error("Request object missing 'routeCurrentSession'")
  if (await hasSession(req, subdomain)) {
    return {
      done: true,
      accountId: req.session!.accountId
    }
  }

  return {
    done: false
  }
}

export async function routeEndSession(subdomain: string, data: any, sessionData?: SessionData, req?: Request) {
  // TODO: After deconnection, send close event to socket used for the user.
  if (!req)
    throw new Error("Request object missing 'routeEndSession'")

  return {
    done: await destroySession(req)
  }
}

/** Used by the admins to set the password of any account. */
export async function routeSetPassword(subdomain: string, data: any, sessionData?: SessionData) {
  if (!sessionData)
    throw new Error("'SessionData' missing in 'routeSetPassword'")

  const cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("You are not allowed to change passwords")

  const cleanData = await validate(data, joiSchemata.routeSetPassword)

  if (whyNewPasswordIsInvalid(cleanData.password)) {
    return {
      done: false,
      reason: "Invalid password"
    }
  }

  await updateAccountPassword(cn, cleanData.accountId, cleanData.password)

  return {
    done: true
  }
}

/** Used by a account to change his password. */
export async function routeChangePassword(subdomain: string, data: any, sessionData?: SessionData) {
  if (!sessionData)
    throw new Error("'SessionData' missing in 'routeChangePassword'")

  const cn = await getCn(subdomain)
  const cleanData = await validate(data, joiSchemata.routeChangePassword)

  if (whyNewPasswordIsInvalid(cleanData.newPassword)) {
    return {
      done: false,
      reason: "Invalid password"
    }
  }

  const account = await getAccountById(cn, sessionData.accountId)

  if (account && await compare(cleanData.currentPassword, account.password)) {
    await updateAccountPassword(cn, account.id, cleanData.newPassword)

    return {
      done: true
    }
  }

  return {
    done: false
  }
}

/** Used by a account to reset his password after he received a password reset email. */
export async function routeResetPassword(subdomain: string, data: any, sessionData?: SessionData, req?: Request) {
  if (!req)
    throw new Error("'Request parameter missing in 'routeResetPassword'")

  const cn = await getCn(subdomain)

  await destroySessionIfAny(req)

  const cleanData = await validate(data, joiSchemata.routeResetPassword)

  if (whyNewPasswordIsInvalid(cleanData.password)) {
    return {
      done: false,
      reason: "Invalid password"
    }
  }

  const tcn = await cn.beginTransaction()
  const answer = { done: false } as any

  try {
    const passwordInfo = await getPasswordUpdateObject(tcn, cleanData.token, cleanData.accountId)
    const currentTs = Math.floor(Date.now())

    if (currentTs - passwordInfo.createTs > passwordResetTokenValidity)
      throw new Error("Token expired")

    await updateAccountPassword(tcn, cleanData.accountId, cleanData.password)
    await removePasswordToken(tcn, data.token)

    answer.done = true
  } catch (error) {
    answer.reason = "Cannot update password"
    appLog.error("Error when resetting password", error.message)
  } finally {
    if (tcn.inTransaction)
      await tcn.rollback()
  }

  return answer
}

export async function routeSendPasswordEmail(subdomain: string, data: any) {
  const context = { subdomain }
  const cn = await getCn(subdomain)
  const cleanData = await validate(data, joiSchemata.routeSendPasswordEmail)
  const account = await getAccountByEmail(cn, cleanData.email)

  if (!account) {
    return {
      done: false,
      reason: "No account with the given email"
    }
  }

  const token = randomBytes(TOKEN_LENGTH).toString("hex")
  const tcn = await cn.beginTransaction()
  const answer = { done: false } as any

  try {
    await storePasswordResetToken(tcn, token, account.id)

    if (await sendPasswordResetMail(context, token, account.id, data.email)) {
      await tcn.commit()
      answer.done = true
    }
  } finally {
    if (tcn.inTransaction)
      await tcn.rollback()
  }

  return answer
}

export async function removeExpiredPasswordTokens(cn: SBConnection) {
  try {
    await cn.exec("delete from reg_pwd where create_ts >= expire_ts")
  } catch (err) {
    appLog.error("Error while removing expired account activation tokens", err)
  }
}

export async function getSessionData(req: Request) {
  if (await hasSession(req)) {
    return {
      accountId: req.session!.accountId,
      subdomain: req.session!.subdomain
    }
  }
}

export async function checkIncomingMessageSession(req: IncomingMessage) {
  const subdomain = getIncomingMessageSubdomain(req)
  if (subdomain && await getConfirmedSubdomain(subdomain) && await hasSession(req as any, subdomain))
    return true
}

export async function hasSession(req: Request, subdomain?: string) {
  subdomain = subdomain ?? await getConfirmedSubdomain(req)
  if (!subdomain || !req.session?.accountId || !req.session?.subdomain)
    return false
  if (typeof req.session.accountId !== "string" || typeof req.session.subdomain !== "string")
    return false
  if (subdomain !== req.session.subdomain)
    return false

  return await getAccountById(await getCn(subdomain), req.session.accountId) !== undefined
}

export async function hasAdminRights(subdomainCn: SBConnection, sessionData: SessionData) {
  const account = await getAccountById(subdomainCn, sessionData.accountId)

  return (account !== undefined && account.role === "admin")
}

async function sendPasswordResetMail(context: BackendContext, token: string, accountId: string, to: string) {
  const url = `${getTeamSiteUrl(context)}/registration?action=passwordreset&token=${token}&uid=${accountId}`
  const html = `Please click <a href="${url}">here</a> if you made a request to change your password.`
  const res = await sendMail({
    to,
    subject: "SmallTeam password reset",
    html
  })

  if (!res.done)
    appLog.error(`Could not send password reset mail: ${res.errorMsg}`)

  return res.done
}

async function storePasswordResetToken(cn: SBConnection, token: string, accountId: string) {
  const currentTs = Math.floor(Date.now())
  const sql = insert("reg_pwd", {
    "account_id": accountId,
    "token": token,
    "create_ts": currentTs,
    "expire_ts": currentTs + passwordResetTokenValidity
  })

  await cn.exec(sql)
}

async function getPasswordUpdateObject(cn: SBConnection, token: string, accountId: string) {
  const sql = select().from("reg_pwd").where("token", token).and("account_id", accountId)
  const row = await cn.singleRow(sql)

  if (!row)
    throw new Error("Token not found")
  else
    return toPasswordUpdateInfo(row)
}

function toPasswordUpdateInfo(row): PasswordUpdateInfo {
  return {
    accountId: row["account_id"].toString(),
    createTs: row["create_ts"],
    token: row["token"]
  }
}

function removePasswordToken(cn: SBConnection, token: string) {
  const sql = deleteFrom("reg_pwd").where("token", token)

  return cn.exec(sql)
}

async function updateAccountPassword(cn: SBConnection, accountId: string, password: string) {
  const passwordHash = await hash(password, BCRYPT_SALT_ROUNDS)
  const sql = update("account", { "password": passwordHash }).where("account_id", accountId)

  await cn.exec(sql)

  return true
}

function destroySession(req: Request): Promise<boolean> {
  return new Promise((resolve) => {
    req.session!.destroy(err => resolve(err ? false : true))
  })
}

async function destroySessionIfAny(req) {
  if (!req || !await hasSession(req))
    return
  await destroySession(req)
}
