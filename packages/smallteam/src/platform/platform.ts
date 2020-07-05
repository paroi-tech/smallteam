import Joi from "@hapi/joi"
import { SBConnection, SBMainConnection } from "@ladc/sql-bricks-modifier"
import { whyNewPasswordIsInvalid, whyTeamSubdomainIsInvalid, whyUsernameIsInvalid } from "@smallteam/shared/dist/libraries/helpers"
import { hash } from "bcrypt"
import { randomBytes } from "crypto"
import * as path from "path"
import { deleteFrom, insert, select, update } from "sql-bricks"
import { appLog, BCRYPT_SALT_ROUNDS, conf, dataDir, packageDir, TOKEN_LENGTH } from "../context"
import { sendMail } from "../mail"
import { getCn, platformCn, strVal } from "../utils/dbUtils"
import { createDir, fileExists, readFile } from "../utils/fsUtils"
import { validate } from "../utils/joiUtils"
import { getMainDomainUrl, getTeamSiteUrl } from "../utils/serverUtils"

const joiSchemata = {
  routeCreateTeam: Joi.object().keys({
    teamName: Joi.string().trim().min(1).required(),
    subdomain: Joi.string().trim().required(),
    name: Joi.string().trim().required(),
    username: Joi.string().trim().required(),
    password: Joi.string().required(),
    email: Joi.string().trim().email().required()
  }),
  routeCheckTeamSubdomain: Joi.object().keys({
    subdomain: Joi.string().trim().required()
  }),
  routeActivateTeam: Joi.object().keys({
    token: Joi.string().trim().hex().length(TOKEN_LENGTH * 2).required()
  })
}

export async function routeCreateTeam(data: any) {
  const cleanData = await validate(data, joiSchemata.routeCreateTeam)

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

  if (whyTeamSubdomainIsInvalid(cleanData.subdomain)) {
    return {
      done: false,
      reason: "Invalid team subdomain"
    }
  }

  const token = randomBytes(TOKEN_LENGTH).toString("hex")
  const tcn = await platformCn.beginTransaction()

  try {
    const teamId = await createTeam(tcn, cleanData)
    const passwordHash = await hash(cleanData.password, BCRYPT_SALT_ROUNDS)

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

export async function routeActivateTeam(data: any) {
  const cleanData = await validate(data, joiSchemata.routeActivateTeam)
  const token = cleanData.token

  const sql = select().from("reg_team")

  sql.innerJoin("team").on("reg_team.team_id", "team.team_id")
  sql.where("reg_team.token", token)

  const rs = await platformCn.singleRow(sql)

  if (!rs) {
    return {
      done: false,
      reason: "Token not found!"
    }
  }

  const subdomain = rs["team_subdomain"] as string
  const teamFolderPath = path.join(dataDir, subdomain)
  const answer = { done: false } as any
  const tcn = await platformCn.beginTransaction()

  try {
    if (!await fileExists(teamFolderPath))
      await createDir(teamFolderPath, 0o755)
    await removeTeamToken(tcn, token)
    await insertTeamDefaultData(await getCn(subdomain), rs)
    await setTeamAsActivated(tcn, strVal(rs["team_id"]))
    await tcn.commit()
    answer.done = true
    answer.teamUrl = getTeamSiteUrl({ subdomain })
  } catch (err) {
    appLog.error("Cannot activate team", err.message, err)
  } finally {
    if (tcn.inTransaction) {
      await tcn.rollback()
      answer.done = false
    }
  }

  return answer
}

export async function routeCheckTeamSubdomain(data: any) {
  const cleanData = await validate(data, joiSchemata.routeCheckTeamSubdomain)

  if (whyTeamSubdomainIsInvalid(cleanData.subdomain)) {
    return {
      done: false,
      reason: "Invalid team subdomain"
    }
  }

  const sql = select().from("team").where("team_subdomain", cleanData.subdomain)
  const p = path.join(conf.dataDir, cleanData.subdomain)
  let b = false

  if (!await fileExists(p)) {
    const rs = await platformCn.all(sql)
    b = rs.length === 0
  }

  return {
    done: true,
    answer: b
  }
}

async function createTeam(cn: SBConnection, data) {
  const sql = insert("team", {
    "team_name": data.teamName,
    "team_subdomain": data.subdomain,
    "activated": 0
  })
  const res = await cn.exec(sql)
  const teamId = res.getInsertedIdAsString()

  return teamId
}

async function storeTeamToken(cn: SBConnection, data, passwordHash: string, teamId: string, token: string) {
  const currentTs = Math.floor(Date.now())
  const expireTs = currentTs + 3 * 24 * 3600 * 1000
  const sql = insert("reg_team", {
    "token": token,
    "team_id": teamId,
    "user_email": data.email,
    "user_name": data.name,
    "user_login": data.username,
    "user_password": passwordHash,
    "create_ts": currentTs,
    "expire_ts": expireTs
  })

  await cn.exec(sql)
}

async function removeTeamToken(cn: SBConnection, token: string) {
  await cn.exec(deleteFrom("reg_team").where("token", token))
}

async function sendTeamCreationMail(token: string, to: string) {
  const url = `${getMainDomainUrl()}/new-team?action=activate&token=${encodeURIComponent(token)}`
  const html = `Please click <a href="${url}">here</a> to activate your team.`
  const res = await sendMail({
    to,
    subject: "Activate Your Team",
    html
  })

  if (!res.done)
    appLog.error("Unable to send team creation mail", res.errorMsg)

  return res.done
}

async function insertTeamDefaultData(cn: SBMainConnection, data) {
  const tcn = await cn.beginTransaction()

  try {
    const statement = insert("account", {
      "name": data["user_name"],
      "login": data["user_login"],
      "password": data["user_password"],
      "role": "admin",
      "email": data["user_email"]
    })
    await tcn.exec(statement)

    const scriptPath = path.join(packageDir, "sql-scripts", "team-default-project.sql")
    const sql = await readFile(scriptPath, "utf8")
    await tcn.script(sql)

    await tcn.commit()
  } finally {
    if (tcn.inTransaction)
      await tcn.rollback()
  }
}

async function setTeamAsActivated(cn: SBConnection, teamId: string) {
  const cmd = update("team").set({ "activated": 1 }).where("team_id", teamId)
  await cn.exec(cmd)
}
