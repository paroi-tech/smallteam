import Joi = require("joi")
import { randomBytes } from "crypto"
import { Request, Response } from "express"
import { select, insert, deleteFrom } from "sql-bricks"
import { hash } from "bcrypt"
import { sendMail } from "../mail"
import { tokenSize, bcryptSaltRounds } from "../backendConfig"
import config from "../../isomorphic/config"
import { getContributorById, getContributorByLogin } from "../utils/userUtils"
import { AuthorizationError } from "../utils/serverUtils"
import { SessionData } from "../session"
import validate from "../utils/joiUtils"
import { URL } from "url"
import { getCn } from "../utils/dbUtils"
import { QueryRunnerWithSqlBricks } from "mycn-with-sql-bricks"

let joiSchemata = {
  routeSendInvitation: Joi.object().keys({
    username: Joi.string().trim().min(4).regex(/[^a-zA-Z_0-9]/, { invert: true }).optional(),
    email: Joi.string().email().required(),
    validity: Joi.number().integer().min(1).max(30)
  }),

  routeResendInvitation: Joi.object().keys({
    invitationId: Joi.number().min(1).required(),
    email: Joi.string().email().required(),
    username: Joi.string().trim().min(4).regex(/[^a-zA-Z_0-9]/, { invert: true }).optional(),
    validity: Joi.number().integer().min(1).max(30)
  }),

  routeCancelInvitation: Joi.object().keys({
    invitationId: Joi.number().min(1).required()
  }),

  routeRegister: Joi.object().keys({
    name: Joi.string().trim().min(1).required(),
    login: Joi.string().trim().min(4).regex(/[^a-zA-Z_0-9]/, { invert: true }).required(),
    password: Joi.string().trim().min(config.minPasswordLength).required(),
    email: Joi.string().email().required(),
    token: Joi.string().hex().length(tokenSize).required()
  })
}

export async function routeSendInvitation(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeSendInvitation'")

  let cn = await getCn(subdomain)
  let contributor = await getContributorById(cn, sessionData.contributorId)

  if (!contributor || contributor.role !== "admin")
    throw new AuthorizationError("You are not allowed to send invitation mails")

  let cleanData = await validate(data, joiSchemata.routeSendInvitation)
  let token = randomBytes(tokenSize).toString("hex")
  let tcn = await cn.beginTransaction()
  let answer = { done: false } as any

  try {
    let inv = await storeAndSendInvitation(tcn, token, cleanData.email, cleanData.validity, cleanData.username)

    if (inv) {
      await tcn.commit()
      answer.invitation = inv
    }
  } finally {
    if (tcn.inTransaction)
      await tcn.rollback()
  }

  return answer
}

export async function routeResendInvitation(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeResendInvitation'")

  let cn = await getCn(subdomain)
  let contributor = await getContributorById(cn, sessionData.contributorId)

  if (!contributor || contributor.role !== "admin")
    throw new AuthorizationError("You are not allowed to send invitation mails")

  let cleanData = await validate(data, joiSchemata.routeResendInvitation)

  if (!existsInvitationWithId(cn, cleanData.invitationId)) {
    return {
      done: false,
      reason: "Invitation not found"
    }
  }

  let answer = { done: false } as any
  let token = randomBytes(tokenSize).toString("hex")
  let tcn = await cn.beginTransaction()

  try {
    await removeInvitationWithId(tcn, cleanData.invitationId)

    let inv = await storeAndSendInvitation(tcn, token, cleanData.email, cleanData.validity, cleanData.username)

    if (inv) {
      await tcn.commit()
      answer.invitation = inv
    }
  } finally {
    if (tcn.inTransaction)
      await tcn.rollback()
  }

  return answer
}

export async function routeCancelInvitation(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeCancelInvitation'")

  let cn = await getCn(subdomain)
  let contributor = await getContributorById(cn, sessionData.contributorId)

  if (!contributor || contributor.role !== "admin")
    throw new AuthorizationError("You are not allowed to cancel invitations")

  let cleanData = await validate(data, joiSchemata.routeCancelInvitation)

  if (await existsInvitationWithId(cn, cleanData.invitationId))
    await removeInvitationWithId(cn, cleanData.invitationId)

  return {
    done: true
  }
}

export async function routeRegister(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  let cn = await getCn(subdomain)
  let cleanData = await validate(data, joiSchemata.routeRegister)

  if (!await existsInvitationWithToken(cn, cleanData.token)) {
    return {
      done: false,
      reason: "Token not found"
    }
  }

  let passwordHash = await hash(cleanData.password, bcryptSaltRounds)
  let query = insert("contributor", {
    "name": cleanData.name,
    "login": cleanData.login,
    "email": cleanData.email,
    password: passwordHash
  })

  let tcn = await cn.beginTransaction()

  try {
    await tcn.execSqlBricks(query)
    await tcn.execSqlBricks(deleteFrom("reg_new").where({ token: cleanData.token }))
    await tcn.commit()
  } finally {
    if (tcn.inTransaction)
      await tcn.rollback()
  }

  return {
    done: true
  }
}

export async function routeGetPendingInvitations(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeGetPendingInvitations'")

  let cn = await getCn(subdomain)
  let contributor = await getContributorById(cn, sessionData.contributorId)

  if (!contributor || contributor.role !== "admin")
    throw new AuthorizationError("You are not allowed to do this")

  let arr = [] as any[]
  let query = select().from("reg_new")
  let result = await cn.allSqlBricks(query)

  for (let row of result)
    arr.push(toInvitation(row))

  return {
    done: true,
    data: arr
  }
}

function toInvitation(row) {
  return {
    id: row["reg_new_id"],
    username: row["username"],
    email: row["user_email"],
    expirationTs: row["expire_ts"],
    creationTs: row["create_ts"]
  }
}

async function storeAndSendInvitation(runner: QueryRunnerWithSqlBricks, token: string, email: string, validity: number, username?: string) {
  try {
    let inv = await storeInvitation(runner, token, email, validity, username)

    if (await sendInvitationMail(token, email, username))
      return Object.assign({}, inv, { username, email })
  } catch (error) {
    console.log("Could not store invitation", error.message)
  }

  return undefined
}

async function sendInvitationMail(token: string, email: string, username?: string) {
  let regUrl = new URL(`${config.host}${config.urlPrefix}/registration`)

  regUrl.searchParams.append("action", "registration")
  regUrl.searchParams.append("token", token)
  if (username)
    regUrl.searchParams.append("username", username)

  let text = `Please follow this link ${regUrl} to create your account.`
  let html = `Please click <a href="${regUrl.toString()}">here</a> to create your account.`
  let result = await sendMail(email, "SmallTeam password reset", text, html)

  if (!result.done)
    console.log(`Could not send invitation mail: ${result.errorMsg}`)

  return result.done
}

async function storeInvitation(cn: QueryRunnerWithSqlBricks, token: string, email: string, validity: number, username?: string) {
  let currentTs = Math.floor(Date.now())
  let expireTs = currentTs + validity * 24 * 3600 * 1000
  let query = insert("reg_new", {
    "user_email": email,
    "token": token,
    "create_ts": currentTs,
    "expire_ts": expireTs
  })

  if (username && !await getContributorByLogin(cn, username))
    query.values({ "user_name": username })

  let result = await cn.execSqlBricks(query)

  return {
    id: result.getInsertedIdString(),
    creationTs: currentTs,
    expirationTs: expireTs
  }
}

async function removeInvitationWithId(cn: QueryRunnerWithSqlBricks, id: string) {
  let query = deleteFrom("reg_new").where({ "reg_new_id": id })

  await cn.execSqlBricks(query)
}

async function removeInvitationWithToken(cn: QueryRunnerWithSqlBricks, token: string) {
  let query = deleteFrom("reg_new").where({ token })

  await cn.execSqlBricks(query)
}

async function existsInvitationWithToken(cn: QueryRunnerWithSqlBricks, token: string) {
  let query = select().from("reg_new").where({ token })
  let row = await cn.singleRowSqlBricks(query)

  return row ? true : false
}

async function existsInvitationWithId(cn: QueryRunnerWithSqlBricks, id: string) {
  let query = select().from("reg_new").where({ "reg_new_id": id })
  let row = await cn.singleRowSqlBricks(query)

  return row ? true : false
}
