import { compare, hash } from "bcrypt"
import { randomBytes } from "crypto"
import { Request, Response } from "express"
import { deleteFrom, insert, select, update } from "sql-bricks"
import Joi = require("joi")
import { bcryptSaltRounds, tokenSize } from "./backendConfig"
import { sendMail } from "./mail"
import { getAccountById, getAccountByLogin, getAccountByEmail } from "./utils/userUtils"
import validate from "./utils/joiUtils"
import { AuthorizationError, getTeamSiteUrl, BackendContext } from "./utils/serverUtils"
import { getCn } from "./utils/dbUtils"
import { QueryRunnerWithSqlBricks } from "mycn-with-sql-bricks"
import { getConfirmedSubdomain } from "./utils/serverUtils"
import { whyNewPasswordIsInvalid, whyUsernameIsInvalid } from "../shared/libraries/helpers"

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
    password: Joi.string().trim().required()
  }),

  routeSetPassword: Joi.object().keys({
    accountId: Joi.string().regex(numberRegex).required(),
    password: Joi.string().trim().required()
  }),

  routeChangePassword: Joi.object().keys({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().trim().required()
  }),

  routeResetPassword: Joi.object().keys({
    token: Joi.string().required(),
    password: Joi.string().trim().required(),
    accountId: Joi.string().regex(numberRegex).required()
  }),

  routeSendPasswordEmail: Joi.object().keys({
    email: Joi.string().email().required()
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

  if (await hasSession(req) && req.session!.subdomain === subdomain) {
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
  let account = await getAccountById(cn, sessionData.accountId)

  if (!account || account.role !== "admin")
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
    console.log("Error when resetting password", error.message)
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

  let token = randomBytes(tokenSize).toString("hex")
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

export async function removeExpiredPasswordTokens(runner: QueryRunnerWithSqlBricks) {
  try {
    await runner.exec("delete from reg_pwd where create_ts >= expire_ts")
  } catch (err) {
    console.log("Error while removing expired account activation tokens", err)
  }
}

export async function getSessionData(req: Request): Promise<SessionData> {
  if (!await hasSession(req))
    throw new Error("Missing session data")

  return {
    accountId: req.session!.accountId,
    subdomain: req.session!.subdomain
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

async function sendPasswordResetMail(context: BackendContext, token: string, accountId: string, address: string) {
  let url = `${getTeamSiteUrl(context)}/registration?action=passwordreset&token=${token}&uid=${accountId}`
  let text = `Please follow this link ${url} if you made a request to change your password.`
  let html = `Please click <a href="${url}">here</a> if you made a request to change your password.`
  let res = await sendMail(address, "SmallTeam password reset", text, html)

  if (!res.done)
    console.log(`Could not send password reset mail: ${res.errorMsg}`)

  return res.done
}

async function storePasswordResetToken(runner: QueryRunnerWithSqlBricks, token: string, accountId: string) {
  let currentTs = Math.floor(Date.now())
  let query = insert("reg_pwd", {
    "account_id": accountId,
    "token": token,
    "create_ts": currentTs,
    "expire_ts": currentTs + passwordResetTokenValidity
  })

  await runner.execSqlBricks(query)
}

async function getPasswordUpdateObject(runner: QueryRunnerWithSqlBricks, token: string, accountId: string) {
  let query = select().from("reg_pwd").where("token", token).and("account_id", accountId)
  let row = await runner.singleRowSqlBricks(query)

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

function removePasswordToken(runner: QueryRunnerWithSqlBricks, token: string) {
  let query = deleteFrom("reg_pwd").where("token", token)

  return runner.execSqlBricks(query)
}

async function updateAccountPassword(runner: QueryRunnerWithSqlBricks, accountId: string, password: string) {
  let passwordHash = await hash(password, bcryptSaltRounds)
  let query = update("account", { "password": passwordHash }).where("account_id", accountId)

  await runner.execSqlBricks(query)

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
