import Joi = require("joi")
import { SessionData } from "./session"
import { select, insert, update, deleteFrom } from "sql-bricks"
import { Request, Response } from "express"
import { randomBytes } from "crypto"
import { tokenSize } from "./backendConfig"
import config from "../isomorphic/config"
import validate from "./utils/joiUtils"
import { cn } from "./utils/dbUtils"
import { TransactionConnectionWithSqlBricks } from "mycn-with-sql-bricks"
import { sendMail } from "./mail"

let joiSchemata = {
  routeCreateTeam: Joi.object().keys({
    teamName: Joi.string().trim(),
    teamCode: Joi.string().trim().min(1).max(config.maxTeamCodeLength).regex(/[a-z0-9][a-z0-9-]*[a-z0-9]$/g),
    username: Joi.string().trim().min(4).regex(/[^a-zA-Z_0-9]/, { invert: true }),
    password: Joi.string().trim().min(config.minPasswordLength).required(),
    email: Joi.string().email().required()
  }),
  routeCheckTeamCode: Joi.object().keys({
    teamCode: Joi.string().trim().min(1).max(config.maxTeamCodeLength).regex(/[a-z0-9][a-z0-9-]*[a-z0-9]$/g),
  })
}

export async function routeCreateTeam(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  let cleanData = await validate(data, joiSchemata.routeCreateTeam)
  let token = randomBytes(tokenSize).toString("hex")
  let result = { done: false }

  let tcn = await cn.beginTransaction()
  try {
    let teamId = await createTeam(tcn, cleanData)
    await storeTeamToken(tcn, data, teamId, token)
    await sendTeamCreationMail(token, cleanData.email)
    tcn.commit()
    result.done = true
  } catch (error) {
      console.log("Error when creating team", error.message)
  } finally {
    if (tcn.inTransaction) {
      await tcn.rollback()
      result.done = false
    }
  }

  return result
}

export async function routeActivateTeam(data: any, sessionData?: SessionData, req?: Request, res?: Response) {

}

export async function routeCheckTeamCode(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  let cleanData = await validate(data, joiSchemata.routeCheckTeamCode)
  let query = select().from("team").where("team_code", cleanData.teamCode)

  try {
    let rs = await cn.allSqlBricks(query)
    return {
      done: true,
      answer: rs.length === 0
    }
  } catch (error) {
    return {
      done: false
    }
  }
}

async function createTeam(cn: TransactionConnectionWithSqlBricks, data) {
  let query = insert("team", {
    "team_name": data.teamName,
    "team_code": data.teamCode,
    "activated": 0
  })
  let r = await cn.execSqlBricks(query)
  let teamId = r.getInsertedIdString()

  return teamId
}

async function storeTeamToken(cn: TransactionConnectionWithSqlBricks, data, teamId: string, token: string) {
  let currentTs = Math.floor(Date.now())
  let expireTs = currentTs + 3 * 24 * 3600 * 1000
  let query = insert("reg_team", {
    "token": token,
    "team_id": teamId,
    "user_email": data.email,
    "user_name": data.username,
    "user_password": data.password,
    "crate_ts": currentTs,
    "expire_ts": expireTs
  })

  await cn.execSqlBricks(query)
}

async function sendTeamCreationMail(token: string, email: string) {
  let url = new URL(`${config.host}${config.urlPrefix}/team.html`)
  url.searchParams.append("action", "activate")
  url.searchParams.append("token", token)

  let text = `Please follow this link ${url} to activate your team.`
  let html = `Please click <a href="${url.toString()}">here</a> to activate your team.`
  let result = await sendMail(email, "Team activation", text, html)

  if (result.done)
    return true
  throw new Error(`Could not send team activation mail: ${result.errorMsg}`)
}
