import { compare, hash } from "bcrypt"
import { randomBytes } from "crypto"
import { Request, Response } from "express"
import { deleteFrom, insert, select, update } from "sql-bricks"
import Joi = require("joi")
import config from "../isomorphic/config"
import { bcryptSaltRounds, tokenSize } from "./backendConfig"
import { sendMail } from "./mail"
import { getContributorById, getContributorByLogin, getContributorByEmail } from "./utils/userUtils"
import validate from "./utils/joiUtils"
import { AuthorizationError, getTeamSiteUrl, BackendContext } from "./utils/serverUtils"
import { getCn } from "./utils/dbUtils"
import { QueryRunnerWithSqlBricks } from "mycn-with-sql-bricks"
import { getConfirmedSubdomain } from "./utils/serverUtils"

const passwordResetTokenValidity = 3 * 24 * 3600 * 1000 /* 3 days */

export interface SessionData {
  contributorId: string
  subdomain: string
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

export async function routeConnect(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("Request object missing 'routeConnect'")

  let cn = await getCn(subdomain)
  let cleanData = await validate(data, joiSchemata.routeConnect)
  let contributor = await getContributorByLogin(cn, cleanData.login)

  if (contributor && await compare(cleanData.password, contributor.password)) {
    req.session!.contributorId = contributor.id
    req.session!.subdomain = subdomain

    return {
      done: true,
      contributorId: contributor.id
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
      contributorId: req.session!.contributorId
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

/** Used by the admins to set the password of any contributor. */
export async function routeSetPassword(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("'SessionData' missing in 'routeSetPassword'")

  let cn = await getCn(subdomain)
  let contributor = await getContributorById(cn, sessionData.contributorId)

  if (!contributor || contributor.role !== "admin")
    throw new AuthorizationError("You are not allowed to change passwords")

  let cleanData = await validate(data, joiSchemata.routeSetPassword)

  await updateContributorPassword(cn, cleanData.contributorId, cleanData.password)

  return {
    done: true
  }
}

/** Used by a contributor to change his password. */
export async function routeChangePassword(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("'SessionData' missing in 'routeChangePassword'")

  let cn = await getCn(subdomain)
  let cleanData = await validate(data, joiSchemata.routeChangePassword)
  let contributor = await getContributorById(cn, sessionData.contributorId)

  if (contributor && await compare(cleanData.currentPassword, contributor.password)) {
    await updateContributorPassword(cn, contributor.id, cleanData.newPassword)

    return {
      done: true
    }
  }

  return {
    done: false
  }
}

/** Used by a contributor to reset his password after he received a password reset email. */
export async function routeResetPassword(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("'Request parameter missing in 'routeResetPassword'")

  let cn = await getCn(subdomain)

  await destroySessionIfAny(req)

  let cleanData = await validate(data, joiSchemata.routeResetPassword)
  let tcn = await cn.beginTransaction()
  let answer = { done: false } as any

  try {
    let passwordInfo = await getPasswordUpdateObject(tcn, cleanData.token, cleanData.contributorId)
    let currentTs = Math.floor(Date.now())

    if (currentTs - passwordInfo.createTs > passwordResetTokenValidity)
      throw new Error("Token expired")

    await updateContributorPassword(tcn, cleanData.contributorId, cleanData.password)
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
  let contributor = await getContributorByEmail(cn, cleanData.email)

  if (!contributor) {
    return {
      done: false,
      reason: "No contributor with the given email"
    }
  }

  let token = randomBytes(tokenSize).toString("hex")
  let tcn = await cn.beginTransaction()
  let answer = { done: false } as any

  try {
    await storePasswordResetToken(tcn, token, contributor.id)

    if (await sendPasswordResetMail(context, token, contributor.id, data.email)) {
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
    contributorId: req.session!.contributorId,
    subdomain: req.session!.subdomain
  }
}

export async function hasSession(req: Request) {
  let subdomain = await getConfirmedSubdomain(req)

  if (!subdomain || !req.session || !req.session.contributorId || !req.session.subdomain)
    return false
  if (typeof req.session.contributorId !== "string" || typeof req.session.subdomain !== "string")
    return false
  if (subdomain !== req.session.subdomain)
    return false

  return await getContributorById(await getCn(subdomain), req.session.contributorId) !== undefined
}

async function sendPasswordResetMail(context: BackendContext, token: string, contributorId: string, address: string) {
  let url = `${getTeamSiteUrl(context)}/registration?action=passwordreset&token=${token}&uid=${contributorId}`
  let text = `Please follow this link ${url} if you made a request to change your password.`
  let html = `Please click <a href="${url}">here</a> if you made a request to change your password.`
  let res = await sendMail(address, "SmallTeam password reset", text, html)

  if (!res.done)
    console.log(`Could not send password reset mail: ${res.errorMsg}`)

  return res.done
}

async function storePasswordResetToken(runner: QueryRunnerWithSqlBricks, token: string, contributorId: string) {
  let currentTs = Math.floor(Date.now())
  let query = insert("reg_pwd", {
    "contributor_id": contributorId,
    "token": token,
    "create_ts": currentTs,
    "expire_ts": currentTs + passwordResetTokenValidity
  })

  await runner.execSqlBricks(query)
}

async function getPasswordUpdateObject(runner: QueryRunnerWithSqlBricks, token: string, contributorId: string) {
  let query = select().from("reg_pwd").where("token", token).and("contributor_id", contributorId)
  let row = await runner.singleRowSqlBricks(query)

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

function removePasswordToken(runner: QueryRunnerWithSqlBricks, token: string) {
  let query = deleteFrom("reg_pwd").where("token", token)

  return runner.execSqlBricks(query)
}

async function updateContributorPassword(runner: QueryRunnerWithSqlBricks, contributorId: string, password: string) {
  let passwordHash = await hash(password, bcryptSaltRounds)
  let query = update("contributor", { "password": passwordHash }).where("contributor_id", contributorId)

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
