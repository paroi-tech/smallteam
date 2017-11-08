import { Request, Response } from "express"
import { hash, compare } from "bcrypt"
import { cn } from "./utils/dbUtils"
import { buildSelect, buildUpdate } from "./utils/sql92builder/Sql92Builder"
import { SessionData } from "./backendContext/context"
import { bcryptSaltRounds } from "./dbqueries/queryContributor"

export async function routeConnect(data: any, req: Request, res: Response): Promise<any> {
  let row = await getContributorByLogin(data.login)
  let sessionData: SessionData = req.session as any

  if (row && await compare(data.password, row.password)) {
    sessionData.contributorId = row.id.toString()
    return {
      done: true,
      contributorId: row.id
    }
  }

  return {
    done: false
  }
}

export async function routeCurrentSession(data: any, req: Request, res: Response): Promise<any> {
  if (req.session && req.session.contributorId && await getContributorById(req.session.contributorId)) {
    return {
      done: true,
      contributorId: req.session.contributorId
    }
  }

  return {
    done: false
  }
}

export async function routeDisconnect(data: any, req: Request, res: Response): Promise<any> {
  let b = await destroySession(req)

  return {
    done: b
  }
}

function destroySession(req: Request): Promise<boolean> {
  return new Promise((resolve, reject) => {
    req.session!.destroy(err => {
      resolve(err ? false : true)
    })
  })
}

export async function routeChangePassword(data: any, req: Request, res: Response) {
  let sessionData: SessionData = req.session as any
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

export async function routeResetPassword(req: Request, res: Response) {
  if (req.query.token) {
    let token = req.query.token as string
    let sql = buildSelect()
      .select("*")
      .from("mail_challenge")
      .where("token", "=", token)
    let rs = await cn.all(sql.toSql())

    // Now, we check timestamp and we send page if the token is still valid.
  }
  res.end()
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

async function updateContributorPassword(contributorId: string, password: string): Promise<boolean> {
  let passwordHash = await hash(password, bcryptSaltRounds)
  let sql = buildUpdate()
              .update("contributor")
              .set({ "password": passwordHash })
              .where("contributor_id", "=", contributorId)

  await cn.run(sql.toSql())

  return true
}
