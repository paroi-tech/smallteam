import { Request, Response } from "express"
import { hash, compare } from "bcrypt"
import { cn } from "./utils/dbUtils"
import { SessionData } from "./backendContext/context"
import { bcryptSaltRounds } from "./dbqueries/queryContributor"
import { tokenMaxValidity } from "./mail"
import { select, update, deleteFrom } from "sql-bricks"

interface PasswordUpdateInfo {
  contributorId: string
  createTs: number
  token: string
}

interface ContributorInfo {
  contributorId: string
  password: string
  role: string
}

// --
// -- Public functions
// --

export async function routeConnect(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("Required parameter missing in route callback")

  sessionData = req.session as any
  let contributor = await getContributorByLogin(data.login)
  if (contributor && await compare(data.password, contributor.password)) {
    sessionData!.contributorId = contributor.contributorId
    return {
      done: true,
      contributorId: contributor.contributorId
    }
  }

  return {
    done: false
  }
}

export async function routeCurrentSession(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (req && req.session && req.session.contributorId && await getContributorById(req.session.contributorId)) {
    return {
      done: true,
      contributorId: req.session.contributorId
    }
  }

  return {
    done: false
  }
}

export async function routeDisconnect(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("Required parameter missing in route callback")

  let b = await destroySession(req)
  return {
    done: b
  }
}

export async function routeSetPassword(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData || !data || !data.contributorId || !data.password)
    throw new Error("Required parameter missing in route callback")

  let contributor = await getContributorById(sessionData.contributorId as string)
  if (!contributor || contributor.role !== "admin")
    throw new Error("Current user is not allowed to change passwords this way")

  await updateContributorPassword(data.contributorId, data.password)
  return {
    done: true
  }
}

export async function routeChangePassword(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("Required parameter missing in route callback")

  let contributor = await getContributorById(sessionData.contributorId as string)
  if (contributor && await compare(data.currentPassword, contributor.password)) {
    await updateContributorPassword(contributor.contributorId, data.newPassword)
    return {
      done: true
    }
  }

  return {
    done: false
  }
}

export async function routeResetPassword(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  let token = data.token as string
  let contributorId = data.contributorId as string
  let query = select().from("reg_pwd").where("token", token).and("contributor_id", contributorId)
  let row

  try {
    row = await cn.singleRowSqlBricks(query)
  } catch (error) {
    return {
      done: false,
      reason: "More than one password reset token available for the contributor"
    }
  }

  if (!row) {
    return {
      done: false,
      reason: "Token not found!"
    }
  }

  let passwordInfo = toPasswordUpdateInfo(row)
  let currentTs = Date.now() / 1000
  if (currentTs - passwordInfo.createTs > tokenMaxValidity) {
    removeMailChallenge(token).catch(err => console.log(`Cannot remove expired mail token ${token}`, err))
    return {
      done: false,
      reason: "Token expired!"
    }
  }

  await updateContributorPassword(data.contributorId, data.password)
  removeMailChallenge(token).catch(err => console.log(`Cannot remove used mail token ${token}`, err))

  return {
    done: true
  }
}

export async function routeSendPasswordResetMail(data: any) {
  if (!data || data.email)
    throw new Error("Email is needed to send password reset token")

  let contributor = getContributorByEmail(data.email)
  if (!contributor) {
    return {
      done: false,
      reason: "No contributor with the given email"
    }
  }

  // TODO: Implement this today...
  return {
    done: true
  }
}

export function getSessionData(req: Request): SessionData {
  if (!req.session || !req.session.contributorId)
    throw new Error(`Missing session data`)
  return {
    contributorId: req.session.contributorId
  }
}

export function hasSessionData(req: Request): boolean {
  return req.session && req.session.contributorId ? true : false
}

// --
// -- Utilily functions
// --

function toPasswordUpdateInfo(row): PasswordUpdateInfo {
  return {
    contributorId: row["contributor_id"].toString(),
    createTs: row["create_ts"],
    token: row["token"]
  }
}

function toContributorInfo(row): ContributorInfo {
  return {
    contributorId: row["contributor_id"].toString(),
    password: row["password"].toString(),
    role: row["role"]
  }
}

function removeMailChallenge(token: string) {
  let query = deleteFrom("reg_pwd").where("token", token)
  return cn.execSqlBricks(query)
}

async function getContributorById(id: string) {
  let query = select(["contributor_id", "password", "role"]).from("contributor").where("contributor_id", id)
  let row = undefined

  try {
    row = await cn.singleRowSqlBricks(query)
  } catch (err) {
    console.log(err)
  }

  return row ? toContributorInfo(row) : undefined
}

async function getContributorByLogin(login: string) {
  let query = select(["contributor_id", "password", "role"]).from("contributor").where("login", login)
  let row

  try {
    row = await cn.singleRowSqlBricks(query)
  } catch (err) {
    console.log(err)
  }

  return row ? toContributorInfo(row) : undefined
}

async function getContributorByEmail(email: string) {
  let query = select(["contributor_id", "password", "role"]).from("contributor").where("email", email)
  let row = undefined

  try {
    row = await cn.singleRowSqlBricks(query)
  } catch (err) {
    console.log(err)
  }

  return row ? toContributorInfo(row) : undefined
}

async function updateContributorPassword(contributorId: string, password: string): Promise<boolean> {
  let passwordHash = await hash(password, bcryptSaltRounds)
  let query = update("contributor", { "password": passwordHash }).where("contributor_id", contributorId)
  await cn.execSqlBricks(query)

  return true
}

function destroySession(req: Request): Promise<boolean> {
  return new Promise((resolve, reject) => {
    req.session!.destroy(err => {
      resolve(err ? false : true)
    })
  })
}
