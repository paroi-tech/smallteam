import { Request, Response } from "express"
import { hash, compare } from "bcrypt"
import { cn } from "./utils/dbUtils"
import { buildSelect, buildUpdate, buildDelete } from "./utils/sql92builder/Sql92Builder"
import { SessionData } from "./backendContext/context"
import { bcryptSaltRounds } from "./dbqueries/queryContributor"
import { store, fetchRelatedFiles, checkImageType, File, fetchRelatedFilesInfo, update, MainMetaCode } from "./uploadEngine"

const tokenMaxValidity = 7 * 24 * 3600 // 7 days

declare type PasswordUpdateInfo = {
  contributorId: string
  createTs: number
  token: string
}

// --
// -- Public functions
// --

export async function routeConnect(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("Required parameter missing in route callback")

  sessionData = req.session as any

  let row = await getContributorByLogin(data.login)

  if (row && await compare(data.password, row.password)) {
    sessionData!.contributorId = row.id.toString()
    return {
      done: true,
      contributorId: row.id
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

export async function routeChangePassword(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("Required parameter missing in route callback")

  let row = await getContributorById(sessionData.contributorId as string)

  if (row && await compare(data.currentPassword, row.password)) {
    await updateContributorPassword(row.id, data.newPassword)
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
  let select = buildSelect()
    .select("*")
    .from("mail_challenge")
    .where("token", "=", token)
    .andWhere("contributor_id", "=", contributorId)
  let rs = await cn.all(select.toSql())

  if (rs.length === 0) {
    return {
      done: false,
      reason: "Token not found!"
    }
  }

  let info = toPasswordUpdateInfo(rs[0])
  let currentTs = Date.now() / 1000
  if (currentTs - info.createTs > tokenMaxValidity) {
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

export async function routeChangeAvatar(req: Request, res: Response) {
  if (!req.file)
    throw new Error("No avatar provided")
  if (!checkImageType(req.file))
    throw new Error("Only PNG, JPEG and GIF files are allowed.")

  let f = req.file
  let sessionData: SessionData = req.session as any
  let contributorId = sessionData.contributorId
  let arr = await fetchRelatedFilesInfo("contributorAvatar", contributorId)

  if (arr.length !== 0)
    return await update(f, arr[0].id, contributorId)
  else
    return await store(f, "contributorAvatar", contributorId, contributorId)
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

function removeMailChallenge(token: string) {
  let sql = buildDelete()
    .deleteFrom("mail_challenge")
    .where("token", "=", token)

  return cn.run(sql.toSql())
}

async function getContributorById(id: string) {
  let sql = buildSelect()
    .select("contributor_id, password")
    .from("contributor")
    .where("contributor_id", "=", id)
  let rs = await cn.all(sql.toSql())

  if (rs.length === 1) {
    return {
      id: rs[0]["contributor_id"].toString(),
      password: rs[0]["password"]
    }
  }

  return undefined
}

async function getContributorByLogin(login: string) {
  let sql = buildSelect()
    .select("contributor_id, password")
    .from("contributor")
    .where("login", "=", login)
  let rs = await cn.all(sql.toSql())

  if (rs.length === 1) {
    return {
      id: rs[0]["contributor_id"].toString(),
      password: rs[0]["password"].toString()
    }
  }

  return undefined
}

async function updateContributorPassword(contributorId: string, password: string): Promise<boolean> {
  let passwordHash = await hash(password, bcryptSaltRounds)
  let sql = buildUpdate()
              .update("contributor")
              .set({ "password": passwordHash })
              .where("contributor_id", "=", contributorId)

  await cn.run(sql.toSql())

  return true
}

function destroySession(req: Request): Promise<boolean> {
  return new Promise((resolve, reject) => {
    req.session!.destroy(err => {
      resolve(err ? false : true)
    })
  })
}
