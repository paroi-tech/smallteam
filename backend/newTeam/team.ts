import * as path from "path"
import { randomBytes } from "crypto"
import { Request, Response } from "express"
import Joi = require("joi")
import { SessionData } from "../session"
import { select, insert, deleteFrom } from "sql-bricks"
import { tokenSize, serverConfig } from "../backendConfig"
import config from "../../isomorphic/config"
import validate from "../utils/joiUtils"
import { QueryRunnerWithSqlBricks } from "mycn-with-sql-bricks"
import { sendMail } from "../mail"
import { teamDbCn, getCn } from "../utils/dbUtils"
import { fileExists, mkdir } from "../utils/fsUtils"

let joiSchemata = {
  routeCreateTeam: Joi.object().keys({
    teamName: Joi.string().trim(),
    teamCode: Joi.string().trim().min(1).max(config.maxTeamCodeLength).regex(/[a-z0-9][a-z0-9-]*[a-z0-9]$/g),
    name: Joi.string().trim().min(4).max(255).required(),
    username: Joi.string().trim().min(4).regex(/[^a-zA-Z_0-9]/, { invert: true }),
    password: Joi.string().trim().min(config.minPasswordLength).required(),
    email: Joi.string().trim().email().required()
  }),
  routeCheckTeamCode: Joi.object().keys({
    teamCode: Joi.string().trim().min(1).max(config.maxTeamCodeLength).regex(/[a-z0-9][a-z0-9-]*[a-z0-9]$/g),
  }),
  routeActivateTeam: Joi.object().keys({
    token: Joi.string().trim().hex().length(tokenSize).required()
  })
}

export async function routeCreateTeam(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  let cleanData = await validate(data, joiSchemata.routeCreateTeam)
  let token = randomBytes(tokenSize).toString("hex")
  let tcn = await teamDbCn.beginTransaction()

  try {
    let teamId = await createTeam(tcn, cleanData)

    await storeTeamToken(tcn, data, teamId, token)
    if (await sendTeamCreationMail(token, cleanData.email))
      await tcn.commit()
  } finally {
    if (tcn.inTransaction) {
      await tcn.rollback()
    }
  }

  return { done: true }
}

export async function routeActivateTeam(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  let cleanData = await validate(data, joiSchemata.routeActivateTeam)
  let token = cleanData.token

  let query = select().from("reg_team")

  query.innerJoin("team").on("reg_team.team_id", "team.team_id")
  query.where("reg_team.token", token)

  let rs = await teamDbCn.singleRowSqlBricks(query)

  if (!rs) {
    return {
      done: false,
      reason: "Token not found"
    }
  }

  let teamCode = rs["team_code"]
  let p = path.join(serverConfig.dataDir, teamCode)
  let answer = { done: false } as any
  let tcn = await teamDbCn.beginTransaction()

  try {
    await mkdir(p, 0o755)
    await removeTeamToken(tcn, token)
    await storeFirstUser(await getCn(teamCode), cleanData)
    tcn.commit()
    answer.done = true
  } catch (err) {
    console.error("Cannot activate team", err.message)
  } finally {
    if (tcn.inTransaction)
      await tcn.rollback()
  }

  return answer
}

export async function routeCheckTeamCode(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  let cleanData = await validate(data, joiSchemata.routeCheckTeamCode)
  let query = select().from("team").where("team_code", cleanData.teamCode)
  let p = path.join(serverConfig.dataDir, cleanData.teamCode)
  let b = false

  if (!await fileExists(p)) {
    let rs = await teamDbCn.allSqlBricks(query)
    b = rs.length === 0
  }

  return {
    answer: b
  }
}

async function createTeam(runner: QueryRunnerWithSqlBricks, data) {
  let query = insert("team", {
    "team_name": data.teamName,
    "team_code": data.teamCode,
    "activated": 0
  })
  let res = await runner.execSqlBricks(query)
  let teamId = res.getInsertedIdString()

  return teamId
}

async function storeTeamToken(runner: QueryRunnerWithSqlBricks, data, teamId: string, token: string) {
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

  await runner.execSqlBricks(query)
}

async function removeTeamToken(runner: QueryRunnerWithSqlBricks, token: string) {
  let cmd = deleteFrom("reg_team").where("token", token)

  await runner.execSqlBricks(cmd)
}

async function sendTeamCreationMail(token: string, email: string) {
  let url = `${config.host}${config.urlPrefix}/team.html?action=activate&token=${encodeURIComponent(token)}`
  let text = `Please follow this link ${url} to activate your team.`
  let html = `Please click <a href="${url}">here</a> to activate your team.`
  let res = await sendMail(email, "Team activation", text, html)

  if (!res.done)
    console.log("Unable to send team creation mail", res.errorMsg)

  return res.done
}

async function storeFirstUser(runner: QueryRunnerWithSqlBricks, data) {
  let cmd = insert("contributor", {
    "name": data.name,
    "login": data.username,
    "password": data.password,
    "role": "admin",
    "email": data.email
  })

  await runner.execSqlBricks(cmd)
}
