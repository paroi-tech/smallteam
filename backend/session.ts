import { compare, hash } from "bcrypt"
import { randomBytes } from "crypto"
import { Request, Response } from "express"
import { deleteFrom, insert, select, update } from "sql-bricks"
import Joi = require("joi")
import config from "../isomorphic/config"
import { bcryptSaltRounds, tokenSize } from "./backendConfig"
import { sendMail } from "./mail"
import { cn } from "./utils/dbUtils"
import { getContributorById, getContributorByLogin, getContributorByEmail } from "./utils/userUtils"
import validate from "./utils/joiUtils"
import { AuthorizationError } from "./utils/serverUtils"

const passwordResetTokenValidity = 3 * 24 * 3600 * 1000 /* 3 days */

export interface SessionData {
  contributorId: string
}

interface PasswordUpdateInfo {
  contributorId: string
  createTs: number
  token: string
}

let numberRegex = /^[1-9][0-9]*$/

let joiSchemata = {
  routeConnect: Joi.object().keys({
    login: Joi.string().trim().alphanum().min(4).required(),
    password: Joi.string().trim().min(config.minPasswordLength).required()
  }),

  routeSetPassword: Joi.object().keys({
    contributorId: Joi.string().regex(numberRegex).required(),
    password: Joi.string().trim().min(config.minPasswordLength).required()
  }),

  routeChangePassword: Joi.object().keys({
    currentPassword: Joi.string().min(8).required(),
    newPassword: Joi.string().trim().min(config.minPasswordLength).required()
  }),

  routeResetPassword: Joi.object().keys({
    token: Joi.string().required(),
    password: Joi.string().trim().min(config.minPasswordLength).required(),
    contributorId: Joi.string().regex(numberRegex).required()
  }),

  routeSendPasswordEmail: Joi.object().keys({
    email: Joi.string().email().required()
  })
}

export async function routeConnect(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("Request object missing 'routeConnect'")

  let cleanData = await validate(data, joiSchemata.routeConnect)
  let contributor = await getContributorByLogin(cleanData.login)
  if (contributor && await compare(cleanData.password, contributor.password)) {
    req.session!.contributorId = contributor.id
    return {
      done: true,
      contributorId: contributor.id
    }
  }

  return {
    done: false
  }
}

export async function routeCurrentSession(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("Request object missing 'routeCurrentSession'")

  if (await hasSessionData(req)) {
    return {
      done: true,
      contributorId: req.session!.contributorId
    }
  }

  return {
    done: false
  }
}

export async function routeEndSession(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("Request object missing 'routeEndSession'")

  let b = await destroySession(req)

  return {
    done: b
  }
}

/** Used by the admins to set the password of any contributor. */
export async function routeSetPassword(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("'SessionData' missing in 'routeSetPassword'")
  let contributor = await getContributorById(sessionData.contributorId)
  if (!contributor || contributor.role !== "admin")
    throw new AuthorizationError("You are not allowed to change passwords")

  let cleanData = await validate(data, joiSchemata.routeSetPassword)
  await updateContributorPassword(cleanData.contributorId, cleanData.password)

  return {
    done: true
  }
}

/** Used by a contributor to change his password. */
export async function routeChangePassword(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("'SessionData' missing in 'routeChangePassword'")

  let cleanData = await validate(data, joiSchemata.routeChangePassword)
  let contributor = await getContributorById(sessionData.contributorId)
  if (contributor && await compare(cleanData.currentPassword, contributor.password)) {
    await updateContributorPassword(contributor.id, cleanData.newPassword)
    return {
      done: true
    }
  }

  return {
    done: false
  }
}

/** Used by a contributor to reset his password after he received a password reset email. */
export async function routeResetPassword(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("'Request parameter missing in 'routeResetPassword'")

  await destroySessionIfAny(req)
  let cleanData = await validate(data, joiSchemata.routeResetPassword)
  try {
    let passwordInfo = await getPasswordUpdateObject(cleanData.token, cleanData.contributorId)
    let currentTs = Math.floor(Date.now())
    if (currentTs - passwordInfo.createTs > passwordResetTokenValidity)
      throw new Error("Token expired")
    await updateContributorPassword(cleanData.contributorId, cleanData.password)
    removePasswordToken(data.token).catch(err => console.log(`Cannot remove used mail token ${data.token}`, err))
  } catch (error) {
    return {
      done: false,
      reason: error.message
    }
  }

  return {
    done: true
  }
}

export async function routeSendPasswordEmail(data: any) {
  let cleanData = await validate(data, joiSchemata.routeSendPasswordEmail)
  let contributor = await getContributorByEmail(cleanData.email)
  if (!contributor) {
    return {
      done: false,
      reason: "No contributor with the given email"
    }
  }

  let token = randomBytes(tokenSize).toString("hex")
  sendPasswordResetMail(token, contributor.id, data.email)
    .then(result => storePasswordResetToken(result.token, result.contributorId))
    .catch(err => console.log("All steps of sending password reset mail have not been processed.", err.message))

  return {
    done: true
  }
}

export async function removeExpiredPasswordTokens() {
  try {
    await cn.exec("delete from reg_pwd where create_ts >= expire_ts")
  } catch (err) {
    console.log("Error while removing expired account activation tokens", err)
  }
}

export async function getSessionData(req: Request): Promise<SessionData> {
  if (!await hasSessionData(req))
    throw new Error("Missing session data")
  return {
    contributorId: req.session!.contributorId
  }
}

export async function hasSessionData(req: Request) {
  if (!req.session || !req.session.contributorId || typeof req.session.contributorId !== "string")
    return false
  return await getContributorById(req.session.contributorId) !== undefined
}

async function sendPasswordResetMail(token: string, contributorId: string, address: string) {
  let host = `${config.host}${config.urlPrefix}`
  let url  = `${host}/registration.html?action=passwordreset&token=${token}&uid=${contributorId}`
  let text = `Please follow this link ${url} if you made a request to change your password.`
  let html = `Please click <a href="${url}">here</a> if you made a request to change your password.`

  let result = await sendMail(address, "SmallTeam password reset", text, html)
  if (result.done)
    return { token, contributorId }
  throw new Error(`Could not send password reset mail: ${result.errorMsg}`)
}

async function storePasswordResetToken(token: string, contributorId: string) {
  let currentTs = Math.floor(Date.now())
  let query = insert("reg_pwd", {
    "contributor_id": contributorId,
    "token": token,
    "create_ts": currentTs,
    "expire_ts": currentTs + passwordResetTokenValidity
  })
  await cn.execSqlBricks(query)
}

async function getPasswordUpdateObject(token: string, contributorId: string) {
  let query = select().from("reg_pwd").where("token", token).and("contributor_id", contributorId)
  let row

  try {
    row = await cn.singleRowSqlBricks(query)
  } catch (error) {
    throw new Error("More than one token found")
  }

  if (!row)
    throw new Error("Token not found")
  else
    return toPasswordUpdateInfo(row)
}

function toPasswordUpdateInfo(row): PasswordUpdateInfo {
  return {
    contributorId: row["contributor_id"].toString(),
    createTs: row["create_ts"],
    token: row["token"]
  }
}

function removePasswordToken(token: string) {
  let query = deleteFrom("reg_pwd").where("token", token)
  return cn.execSqlBricks(query)
}

async function updateContributorPassword(contributorId: string, password: string) {
  let passwordHash = await hash(password, bcryptSaltRounds)
  let query = update("contributor", { "password": passwordHash }).where("contributor_id", contributorId)
  await cn.execSqlBricks(query)

  return true
}

function destroySession(req: Request): Promise<boolean> {
  return new Promise((resolve, reject) => {
    req.session!.destroy(err => resolve(err ? false : true))
  })
}

async function destroySessionIfAny(req) {
  if (!req || !await hasSessionData(req))
    return
  destroySession(req)
}
