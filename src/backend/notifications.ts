import * as crypto from "crypto"
import { tokenSize } from "./backendConfig"
import { Request, Response } from "express"
import { SessionData, hasAdminRights } from "./session"
import { getCn } from "./utils/dbUtils"
import { select, insert } from "sql-bricks"
import { QueryRunnerWithSqlBricks } from "mycn-with-sql-bricks"
import Joi = require("joi")
import validate, { isHexString } from "./utils/joiUtils"
import { AuthorizationError } from "./utils/serverUtils"

const HOOK_UID_LENGTH = 8

let commitSchema = Joi.object().keys({
  sha: Joi.string().hex().required(),
  message: Joi.string().default(""),
  author: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required(),
  }),
  url: Joi.string().uri(),
  distinct: Joi.boolean().required()
})

let pushDataSchema = Joi.object().keys({
  ref: Joi.string().required(),
  head: Joi.string().required(),
  before: Joi.string().required(),
  size: Joi.number().integer().required(),
  distinct_size: Joi.number().integer().required(),
  commits: Joi.array().items(commitSchema)
})

let routeCreateHookSchema = Joi.object().keys({
  secret: Joi.string().hex().length(tokenSize * 2).required()
})

let routeGetSecretSchema = Joi.object().keys({
  hookId: Joi.string().regex(/\d+/).required()
})

export async function routeCreateGithubHook(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeCreateGithubHook'")

  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  let cleanData = await validate(data, routeCreateHookSchema)
  let uid = crypto.randomBytes(HOOK_UID_LENGTH).toString("hex")
  let cmd = insert("hook", {
    "secret": cleanData.secret,
    "provider": "Github",
    "hook_uid": uid
  })

  await cn.execSqlBricks(cmd)

  return {
    done: true,
    uid
  }
}

export async function routeGenerateSecret(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeGenerateSecret'")

  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  return {
    done: true,
    secret: crypto.randomBytes(tokenSize).toString("hex")
  }
}

export async function routeGetGithubHookSecret(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeGenerateSecret'")

  let cleanData = await validate(data, routeGetSecretSchema)
  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  let query = select("secret").from("hook").where({ "provider": "Github", "hook_id": cleanData.hookId })
  let secret = await cn.singleValueSqlBricks(query)

  return {
    done: true,
    secret
  }
}

export async function routeFetchGithubHooks(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
  throw new Error("Missing session data in 'routeGenerateSecret'")

  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  let query = select().from("hook").where({ "provider": "Github" }) // FIXME: create index on provider column?
  let rs = await cn.allSqlBricks(query)
  let hooks = rs.map(row => ({
    id: row["hook_id"].toString(),
    provider: row["provider"],
    uid: row["hook_uid"],
    activated: row["activated"] != 0
  }))

  return {
    done: true,
    hooks
  }
}

export async function routeProcessGithubNotification(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  let ts = Date.now()

  if (!req || !res)
    throw new Error("Missing request or response object in route.")

  let reqBody = req["rawBody"]
  if (reqBody || typeof reqBody !== "string")
    throw new Error("Missing 'rawBody' attribute in request.")

  let hookEvent = req.headers["x-github-event"]
  if (!hookEvent || typeof hookEvent !== "string" || hookEvent !== "push")
    throw new Error("Unsupported hook event")

  let hookUid = req.params.uid
  if (!hookUid || !isHexString(hookUid))
    throw new Error("Invalid URL")

  let cn = await getCn(subdomain)
  let secret = await getActiveGithubHookSecret(cn, hookUid)

  if (!secret)
    throw new Error("No Github hook found") // FIXME: return 404 status code instead.

  let reqDigest = req.headers["x-hub-signature"]
  if (!reqDigest || typeof reqDigest !== "string")
    throw new Error("Invalid digest")

  let digest = crypto.createHmac("sha1", hookUid).update(reqBody).digest("hex")
  if (reqDigest !== digest)
    throw new Error("Invalid message digest")

  let cleanData = await validate(data, pushDataSchema)
  let deliveryGuid = getDeliveryGuid(req)
  let tcn = await cn.beginTransaction()

  try {
    for (let commit of cleanData.commits)
      processCommit(tcn, commit, ts, deliveryGuid)
    await tcn.commit()
  } finally {
    if (tcn.inTransaction)
      await tcn.rollback()
  }
}

async function getActiveGithubHookSecret(runner: QueryRunnerWithSqlBricks, uid: string) {
  let query = select("activated, secret").from("options").where({ "provider": "Github", "hook_uid": uid })
  let res = runner.singleRowSqlBricks(query)

  if (res && res["activated"] != 0)
    return res["secret"]
}

/**
 * What this does is:
 *  - save the commit in db,
 *  - search for task codes in the commit message,
 *  - and attach commit to the tasks.
 */
async function processCommit(runner: QueryRunnerWithSqlBricks, commit, ts: number, deliveryGuid?: string) {
  let commitId = await saveCommit(runner, commit, ts, deliveryGuid)

  for (let taskCode of getTaskCodesInCommitMessage(commit.message)) {
    let taskId = await getIdOfTaskWithCode(runner, taskCode)

    if (taskId)
      addCommitToTask(runner, taskId, commitId)
  }
}

async function saveCommit(runner: QueryRunnerWithSqlBricks, commit, ts: number, deliveryGuid?: string) {
  let cmd = insert("commit", {
    "external_id": commit.sha,
    "message": commit.message,
    "author_name": commit.author.name,
    "ts": ts,
    "notification_id": deliveryGuid || null
  })
  let res = await runner.execSqlBricks(cmd)

  return res.getInsertedIdString()
}

function getDeliveryGuid(req) {
  let guid = req.headers["x-github-delivery"]

  if (guid && typeof guid === "string")
    return guid
}

function getTaskCodesInCommitMessage(message: string) {
  return message.match(/[a-zA-Z0-9]-[\d]+/g) || [] as string[]
}

function getProjectCodeFromTaskCode(taskCode: string) {
  let arr = taskCode.split("-")

  if (arr.length > 1)
    return arr[0]
}

async function getIdOfTaskWithCode(runner: QueryRunnerWithSqlBricks, code: string) {
  let query = select("task_id").from("task").where({ code })
  let res = runner.singleValueSqlBricks(query)

  if (res)
    return res.toString()
}

async function addCommitToTask(runner: QueryRunnerWithSqlBricks, taskId: string, commitId: string) {
  let cmd = insert("task_commit", { "task_id": taskId, "commit_id": commitId })

  await runner.execSqlBricks(cmd)
}
