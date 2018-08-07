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

export async function routeCheckTeamCode(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  let cleanData = await validate(data, joiSchemata.routeCreateTeam)
  let token = randomBytes(tokenSize).toString("hex")

  return {
    done: true,
    answer: false,
    reason: "Not implemented yet"
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
