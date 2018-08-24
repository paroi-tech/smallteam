import * as path from "path"
import { randomBytes } from "crypto"
import { Request, Response } from "express"
import Joi = require("joi")
import { SessionData } from "../session"
import { select, insert,  update, deleteFrom } from "sql-bricks"
import { tokenSize, config, bcryptSaltRounds } from "../backendConfig"
import validate from "../utils/joiUtils"
import { QueryRunnerWithSqlBricks } from "mycn-with-sql-bricks"
import { sendMail } from "../mail"
import { hash } from "bcrypt"
import { teamDbCn, getCn } from "../utils/dbUtils"
import { fileExists, mkdir } from "../utils/fsUtils"
import { getMainDomainUrl, getTeamSiteUrl } from "../utils/serverUtils"
import { whyUsernameIsInvalid, whyNewPasswordIsInvalid, whyTeamCodeIsInvalid } from "../../shared/libraries/helpers"
import { log } from "../utils/log"

let joiSchemata = {
  routeCreateTeam: Joi.object().keys({
    teamName: Joi.string().trim().min(1).required(),
    teamCode: Joi.string().trim().required(),
    name: Joi.string().trim().required(),
    username: Joi.string().trim().required(),
    password: Joi.string().required(),
    email: Joi.string().trim().email().required()
  }),
  routeCheckTeamCode: Joi.object().keys({
    teamCode: Joi.string().trim().required(),
  }),
  routeActivateTeam: Joi.object().keys({
    token: Joi.string().trim().hex().length(tokenSize * 2).required()
  })
}

export async function routeCreateTeam(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  let cleanData = await validate(data, joiSchemata.routeCreateTeam)

  if (whyUsernameIsInvalid(cleanData.username)) {
    return {
      done: false,
      reason: "Invalid username"
    }
  }

  if (whyNewPasswordIsInvalid(cleanData.password)) {
    return {
      done: false,
      reason: "Invalid password"
    }
  }

  if (whyTeamCodeIsInvalid(cleanData.teamCode)) {
    return {
      done: false,
      reason: "Invalid team code"
    }
  }

  let token = randomBytes(tokenSize).toString("hex")
  let tcn = await teamDbCn.beginTransaction()

  try {
    let teamId = await createTeam(tcn, cleanData)
    let passwordHash = await hash(cleanData.password, bcryptSaltRounds)

    await storeTeamToken(tcn, data, passwordHash, teamId, token)
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
  let p = path.join(config.dataDir, teamCode)
  let answer = { done: false } as any
  let tcn = await teamDbCn.beginTransaction()

  try {
    await mkdir(p, 0o755)
    await removeTeamToken(tcn, token)
    await storeFirstUser(await getCn(teamCode), rs)
    await setTeamAsActivated(tcn, rs["team_id"])
    tcn.commit()
    answer.done = true
    answer.teamUrl = getTeamSiteUrl({ subdomain: teamCode })
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

  if (whyTeamCodeIsInvalid(cleanData.teamCode)) {
    return {
      done: false,
      reason: "Invalid team code"
    }
  }

  let query = select().from("team").where("team_code", cleanData.teamCode)
  let p = path.join(config.dataDir, cleanData.teamCode)
  let b = false

  if (!await fileExists(p)) {
    let rs = await teamDbCn.allSqlBricks(query)
    b = rs.length === 0
  }

  return {
    done: true,
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

async function storeTeamToken(runner: QueryRunnerWithSqlBricks, data, passwordHash: string, teamId: string, token: string) {
  let currentTs = Math.floor(Date.now())
  let expireTs = currentTs + 3 * 24 * 3600 * 1000
  let query = insert("reg_team", {
    "token": token,
    "team_id": teamId,
    "user_email": data.email,
    "user_name": data.name,
    "user_login": data.username,
    "user_password": passwordHash,
    "create_ts": currentTs,
    "expire_ts": expireTs
  })

  await runner.execSqlBricks(query)
}

async function removeTeamToken(runner: QueryRunnerWithSqlBricks, token: string) {
  let cmd = deleteFrom("reg_team").where("token", token)

  await runner.execSqlBricks(cmd)
}

async function sendTeamCreationMail(token: string, to: string) {
  let url = `${getMainDomainUrl()}/new-team?action=activate&token=${encodeURIComponent(token)}`
  let html = `Please click <a href="${url}">here</a> to activate your team.`
  let res = await sendMail({
    to,
    subject: "Activate Your Team",
    html
  })

  if (!res.done)
    log.error("Unable to send team creation mail", res.errorMsg)

  return res.done
}

async function storeFirstUser(runner: QueryRunnerWithSqlBricks, data) {
  let cmd = insert("account", {
    "name": data["user_name"],
    "login": data["user_login"],
    "password": data["user_password"],
    "role": "admin",
    "email": data["user_email"]
  })

  await runner.execSqlBricks(cmd)
}

async function setTeamAsActivated(runner: QueryRunnerWithSqlBricks, teamId: string) {
  let cmd = update("team", { "activated": 1 }).where("team_id", teamId)

  await runner.execSqlBricks(cmd)
}
