import { compare, hash } from "bcrypt"
import { randomBytes } from "crypto"
import { Request, Response } from "express"
import Joi = require("joi")
import { QueryRunnerWithSqlBricks } from "mycn-with-sql-bricks"
import { deleteFrom, insert, select, update } from "sql-bricks"
import { whyNewPasswordIsInvalid } from "../shared/libraries/helpers"
import { BCRYPT_SALT_ROUNDS, TOKEN_LENGTH } from "./backendConfig"
import { sendMail } from "./mail"
import { getCn } from "./utils/dbUtils"
import validate from "./utils/joiUtils"
import { log } from "./utils/log"
import { getConfirmedSubdomain } from "./utils/serverUtils"
import { AuthorizationError, BackendContext, getTeamSiteUrl } from "./utils/serverUtils"
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

let numberRegex = /^[1-9][0-9]*$/

let joiSchemata = {
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

export async function routeConnect(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("Request object missing 'routeConnect'")

  let cn = await getCn(subdomain)
  let cleanData = await validate(data, joiSchemata.routeConnect)
  let account = await getAccountByLogin(cn, cleanData.login)

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

export async function routeCurrentSession(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("Request object missing 'routeCurrentSession'")

  if (await hasSessionForSubdomain(req, subdomain)) {
    return {
      done: true,
      accountId: req.session!.accountId
    }
  }

  return {
    done: false
  }
}

export async function routeEndSession(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("Request object missing 'routeEndSession'")

  return {
    done: await destroySession(req)
  }
}

/** Used by the admins to set the password of any account. */
export async function routeSetPassword(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("'SessionData' missing in 'routeSetPassword'")

  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("You are not allowed to change passwords")

  let cleanData = await validate(data, joiSchemata.routeSetPassword)

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
export async function routeChangePassword(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("'SessionData' missing in 'routeChangePassword'")

  let cn = await getCn(subdomain)
  let cleanData = await validate(data, joiSchemata.routeChangePassword)

  if (whyNewPasswordIsInvalid(cleanData.newPassword)) {
    return {
      done: false,
      reason: "Invalid password"
    }
  }

  let account = await getAccountById(cn, sessionData.accountId)

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
export async function routeResetPassword(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("'Request parameter missing in 'routeResetPassword'")

  let cn = await getCn(subdomain)

  await destroySessionIfAny(req)

  let cleanData = await validate(data, joiSchemata.routeResetPassword)

  if (whyNewPasswordIsInvalid(cleanData.password)) {
    return {
      done: false,
      reason: "Invalid password"
    }
  }

  let tcn = await cn.beginTransaction()
  let answer = { done: false } as any

  try {
    let passwordInfo = await getPasswordUpdateObject(tcn, cleanData.token, cleanData.accountId)
    let currentTs = Math.floor(Date.now())

    if (currentTs - passwordInfo.createTs > passwordResetTokenValidity)
      throw new Error("Token expired")

    await updateAccountPassword(tcn, cleanData.accountId, cleanData.password)
    await removePasswordToken(tcn, data.token)

    answer.done = true
  } catch (error) {
    answer.reason = "Cannot update password"
    log.error("Error when resetting password", error.message)
  } finally {
    if (tcn.inTransaction)
      await tcn.rollback()
  }

  return answer
}

export async function routeSendPasswordEmail(subdomain: string, data: any) {
  let context = { subdomain }
  let cn = await getCn(subdomain)
  let cleanData = await validate(data, joiSchemata.routeSendPasswordEmail)
  let account = await getAccountByEmail(cn, cleanData.email)

  if (!account) {
    return {
      done: false,
      reason: "No account with the given email"
    }
  }

  let token = randomBytes(TOKEN_LENGTH).toString("hex")
  let tcn = await cn.beginTransaction()
  let answer = { done: false } as any

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

export async function removeExpiredPasswordTokens(cn: QueryRunnerWithSqlBricks) {
  try {
    await cn.exec("delete from reg_pwd where create_ts >= expire_ts")
  } catch (err) {
    log.error("Error while removing expired account activation tokens", err)
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

export async function hasSession(req: Request) {
  let subdomain = await getConfirmedSubdomain(req)

  if (!subdomain || !req.session || !req.session.accountId || !req.session.subdomain)
    return false
  if (typeof req.session.accountId !== "string" || typeof req.session.subdomain !== "string")
    return false
  if (subdomain !== req.session.subdomain)
    return false

  return await getAccountById(await getCn(subdomain), req.session.accountId) !== undefined
}

/**
 * Note: the subdomain parameter should be the result of getConfirmedSubdomain()
 * with the request object as parameter. This function is used to avoid to call
 * getConfirmedSubdomain twice with the same request object.
 */
export async function hasSessionForSubdomain(req: Request, subdomain: string) {
  if (!req.session || !req.session.accountId || !req.session.subdomain)
    return false
  if (typeof req.session.accountId !== "string" || typeof req.session.subdomain !== "string")
    return false
  if (req.session.subdomain !== subdomain)
    return false

  return await getAccountById(await getCn(subdomain), req.session.accountId) !== undefined
}

export async function hasAdminRights(subdomainCn: QueryRunnerWithSqlBricks, sessionData: SessionData) {
  let account = await getAccountById(subdomainCn, sessionData.accountId)

  return (account !== undefined && account.role === "admin")
}

async function sendPasswordResetMail(context: BackendContext, token: string, accountId: string, to: string) {
  let url = `${getTeamSiteUrl(context)}/registration?action=passwordreset&token=${token}&uid=${accountId}`
  let html = `Please click <a href="${url}">here</a> if you made a request to change your password.`
  let res = await sendMail({
    to,
    subject: "SmallTeam password reset",
    html
  })

  if (!res.done)
    log.error(`Could not send password reset mail: ${res.errorMsg}`)

  return res.done
}

async function storePasswordResetToken(cn: QueryRunnerWithSqlBricks, token: string, accountId: string) {
  let currentTs = Math.floor(Date.now())
  let sql = insert("reg_pwd", {
    "account_id": accountId,
    "token": token,
    "create_ts": currentTs,
    "expire_ts": currentTs + passwordResetTokenValidity
  })

  await cn.execSqlBricks(sql)
}

async function getPasswordUpdateObject(cn: QueryRunnerWithSqlBricks, token: string, accountId: string) {
  let sql = select().from("reg_pwd").where("token", token).and("account_id", accountId)
  let row = await cn.singleRowSqlBricks(sql)

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

function removePasswordToken(cn: QueryRunnerWithSqlBricks, token: string) {
  let sql = deleteFrom("reg_pwd").where("token", token)

  return cn.execSqlBricks(sql)
}

async function updateAccountPassword(cn: QueryRunnerWithSqlBricks, accountId: string, password: string) {
  let passwordHash = await hash(password, BCRYPT_SALT_ROUNDS)
  let sql = update("account", { "password": passwordHash }).where("account_id", accountId)

  await cn.execSqlBricks(sql)

  return true
}

function destroySession(req: Request): Promise<boolean> {
  return new Promise((resolve, reject) => {
    req.session!.destroy(err => resolve(err ? false : true))
  })
}

async function destroySessionIfAny(req) {
  if (!req || !await hasSession(req))
    return
  await destroySession(req)
}
