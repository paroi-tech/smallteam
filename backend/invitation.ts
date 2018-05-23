import Joi = require("joi")
import { randomBytes } from "crypto"
import { Request, Response } from "express"
import { select, insert, update, deleteFrom } from "sql-bricks"
import { hash } from "bcrypt"
import { cn } from "./utils/dbUtils"
import { sendMail } from "./mail"
import { tokenSize, bcryptSaltRounds } from "./backendConfig"
import config from "../isomorphic/config"
import { getContributorById, getContributorByLogin } from "./utils/userUtils"
import { AuthorizationError } from "./utils/serverUtils"
import { SessionData } from "./session"
import validate from "./utils/joiUtils"
import { URL } from "url"

let joiSchemata = {
  routeSendInvitation: Joi.object().keys({
    username: Joi.string().trim().min(4).optional(),
    email: Joi.string().email().required(),
    validity: Joi.number().integer().min(1).max(30)
  }),

  routeResendInvitation: Joi.object().keys({
    invitationId: Joi.number().min(1).required(),
    email: Joi.string().email().required(),
    username: Joi.string().trim().min(4).optional(),
    validity: Joi.number().integer().min(1).max(30)
  }),

  routeCancelInvitation: Joi.object().keys({
    invitationId: Joi.number().min(1).required()
  }),

  routeRegister: Joi.object().keys({
    name: Joi.string().trim().min(1).required(),
    login: Joi.string().trim().min(4).required(),
    password: Joi.string().trim().min(config.minPasswordLength).required(),
    email: Joi.string().email().required(),
    token: Joi.string().hex().required()
  })
}

export async function routeSendInvitation(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeSendInvitation'")
  let contributor = await getContributorById(sessionData.contributorId)
  if (!contributor || contributor.role !== "admin")
    throw new AuthorizationError("You are not allowed to send invitation mails")

  let cleanData = await Joi.validate(data, joiSchemata.routeSendInvitation)
  let token = randomBytes(tokenSize).toString("hex")
  let result = await storeInvitation(token, cleanData.email, cleanData.validity, cleanData.username)
  sendInvitationMail(token, cleanData.email, cleanData.username).catch(err => {
    console.log("All steps of sending invitation mail have not been completed.", err.message)
  })

  return {
    done: true,
    invitation: {
      username: cleanData.username,
      email: cleanData.email,
      ...result
    }
  }
}

export async function routeResendInvitation(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeResendInvitation'")
  let contributor = await getContributorById(sessionData.contributorId)
  if (!contributor || contributor.role !== "admin")
    throw new AuthorizationError("You are not allowed to send invitation mails")

  let cleanData = await validate(data, joiSchemata.routeResendInvitation)
  if (!invitationExists(cleanData.invitationId)) {
    return {
      done: false,
      reason: "Invitation not found"
    }
  }

  await removeInvitationWithId(cleanData.invitationId)
  let token = randomBytes(tokenSize).toString("hex")
  let result = await storeInvitation(token, cleanData.email, cleanData.validity, cleanData.username)
  sendInvitationMail(token, cleanData.email, cleanData.username).catch(err => {
    console.log("All steps of sending invitation mail have not been processed.***", err.message)
  })

  return {
    done: true,
    invitation: {
      email: cleanData.email,
      username: cleanData.username,
      ...result
    }
  }
}

export async function routeCancelInvitation(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeCancelInvitation'")
  let contributor = await getContributorById(sessionData.contributorId)
  if (!contributor || contributor.role !== "admin")
    throw new AuthorizationError("You are not allowed to cancel invitations")

  let cleanData = await validate(data, joiSchemata.routeCancelInvitation)
  if (await invitationExists(cleanData.invitationId))
    await removeInvitationWithId(cleanData.invitationId)

  return {
    done: true
  }
}

export async function routeRegister(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  let cleanData = await validate(data, joiSchemata.routeRegister)
  if (!await tokenExists(cleanData.token)) {
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
  let transaction = await cn.beginTransaction()

  try {
    await transaction.execSqlBricks(query)
    await transaction.execSqlBricks(deleteFrom("reg_new").where({ token: cleanData.token }))
    transaction.commit()
  } finally {
    if (transaction.inTransaction)
      transaction.rollback()
  }

  return {
    done: true
  }
}

export async function routeGetPendingInvitations(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeGetPendingInvitations'")
  let contributor = await getContributorById(sessionData.contributorId)
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

async function sendInvitationMail(token: string, email: string, username?: string) {
  let regUrl = new URL(`${config.host}${config.urlPrefix}/registration.html`)
  regUrl.searchParams.append("action", "registration")
  regUrl.searchParams.append("token", token)
  if (username)
    regUrl.searchParams.append("username", username)

  let text = `Please follow this link ${regUrl} to create your account.`
  let html = `Please click <a href="${regUrl.toString()}">here</a> to create your account.`

  let result = await sendMail(email, "SmallTeam password reset", text, html)
  if (result.done)
    return true
  throw new Error(`Could not send password reset mail. Error: ${result.error.message}`)
}

async function storeInvitation(token: string, email: string, validity: number, username?: string) {
  let currentTs = Math.floor(Date.now())
  let expireTs = currentTs + validity * 24 * 3600 * 1000
  let query = insert("reg_new", {
    "user_email": email,
    "token": token,
    "create_ts": currentTs,
    "expire_ts": expireTs
  })

  if (username && !await getContributorByLogin(username))
    query.values({ "user_name": username })
  let result = await cn.execSqlBricks(query)

  return {
    id: result.getInsertedIdString(),
    creationTs: currentTs,
    expirationTs: expireTs
  }
}

async function removeInvitationWithId(invitationId: string) {
  let query = deleteFrom("reg_new").where({ "reg_new_id": invitationId })
  await cn.execSqlBricks(query)
}

async function removeInvitationWithToken(token: string) {
  let query = deleteFrom("reg_new").where({ token })
  await cn.execSqlBricks(query)
}

async function tokenExists(token: string) {
  let query = select().from("reg_new").where({ token })
  // 'singleRowSqlBricks' throws an exception if the query returns more than one row. This should never happen, that's
  // why we don't handle the exception. If this ever happens, that means there was a problem with the db and tokens.
  let row = await cn.singleRowSqlBricks(query)
  return row ? true : false
}

async function invitationExists(invitationId: string) {
  let query = select().from("reg_new").where({ "reg_new_id": invitationId })
  let row = await cn.singleRowSqlBricks(query)
  return row ? true : false
}
