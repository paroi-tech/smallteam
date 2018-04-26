import { randomBytes } from "crypto"
import { Request, Response } from "express"
import { hash, compare } from "bcrypt"
import { cn } from "./utils/dbUtils"
import { SessionData } from "./backendContext/context"
import { bcryptSaltRounds } from "./backendConfig"
import { tokenMaxValidity } from "./mail"
import { select, insert, update, deleteFrom } from "sql-bricks"
import { sendMail } from "./mail"
import config from "../isomorphic/config"
import { tokenSize } from "./backendConfig"
import { getContributorByLogin, getContributorByEmail, getContributorById } from "./dbqueries/queryContributor"

interface PasswordUpdateInfo {
  contributorId: string
  createTs: number
  token: string
}

export async function routeConnect(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("Request object missing 'routeConnect'")

  let contributor = await getContributorByLogin(data.login)
  if (contributor && await compare(data.password, contributor.password)) {
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

/** Used by the admins to set the password of any cntributor. */
export async function routeSetPassword(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("'SessionData' missing in 'routeSetPassword'")

  let contributor = await getContributorById(sessionData.contributorId)
  if (!contributor || contributor.role !== "admin")
    throw new Error("You are not allowed to change passwords")
  await updateContributorPassword(data.contributorId, data.password)

  return {
    done: true
  }
}

/** Used by a contributor to change his password. */
export async function routeChangePassword(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("'SessionData' missing in 'routeChangePassword'")

  let contributor = await getContributorById(sessionData.contributorId)
  if (contributor && await compare(data.currentPassword, contributor.password)) {
    await updateContributorPassword(contributor.id, data.newPassword)
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
  await destroySessionIfAny(req)

  try {
    let passwordInfo = await getPasswordUpdateInfo(data.token, data.contributorId)
    let currentTs = Date.now() / 1000
    if (currentTs - passwordInfo.createTs > tokenMaxValidity)
      throw new Error("Token expired")
    await updateContributorPassword(data.contributorId, data.password)
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

async function getPasswordUpdateInfo(token: string, contributorId: string) {
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
