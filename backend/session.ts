import { hash, compare } from "bcrypt"
import { cn } from "./utils/dbUtils"
import { buildSelect, buildUpdate } from "./utils/sql92builder/Sql92Builder"
import { SessionData } from "./backendContext/context"
import { bcryptSaltRounds } from "./dbqueries/queryContributor"

export async function routeConnect(data: any, sessionData: SessionData): Promise<any> {
  let row = await getContributorByLogin(data.login)

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

export async function routeCurrentSession(data: any, sessionData?: SessionData): Promise<any> {
  if (sessionData && sessionData.contributorId && await getContributorById(sessionData.contributorId)) {
    return {
      done: true,
      contributorId: sessionData.contributorId
    }
  }

  return {
    done: false
  }
}

export async function routeDisconnect(data: any, sessionData: SessionData): Promise<any> {
  // FIXME: Is this the only thing to do?
  sessionData.contributorId = ""

  return {
    done: true
  }
}

export async function routeChangePassword(data: any, sessionData: SessionData): Promise<boolean> {
  let row = await getContributorById(sessionData.contributorId)

  if (row && await compare(data.currentPassword, row.password)) {
    updateContributorPassword(row.id, data.newPassword)

    return true
  }

  return false
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
      password: rs[0]["password"]
    }
  }

  return undefined
}

async function getContributorById(id: string) {
  let sql = buildSelect()
    .select("contributor_id, password")
    .from("contributor")
    .where("id", "=", id)
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
