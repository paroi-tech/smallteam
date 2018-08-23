import * as crypto from "crypto"
import { tokenSize } from "./backendConfig"
import { Request, Response } from "express"
import { SessionData } from "./session"
import { getCn } from "./utils/dbUtils"
import { select, insert } from "sql-bricks"
import { QueryRunnerWithSqlBricks } from "mycn-with-sql-bricks"
import Joi = require("joi")
import validate, { isHexString } from "./utils/joiUtils"
import { getAccountById } from "./utils/userUtils"
import { AuthorizationError } from "./utils/serverUtils"

let commitSchemata = Joi.object().keys({
  sha: Joi.string().hex().required(),
  message: Joi.string().default(""),
  author: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required(),
  }),
  url: Joi.string().uri(),
  distinct: Joi.boolean().required()
})

let pushDataSchemata = Joi.object().keys({
  ref: Joi.string().required(),
  head: Joi.string().required(),
  before: Joi.string().required(),
  size: Joi.number().integer().required(),
  distinct_size: Joi.number().integer().required(),
  commits: Joi.array().items(commitSchemata)
})

let routeCreateHookSchemata = Joi.object().keys({
  secret: Joi.string().hex().length(tokenSize * 2).required()
})

export async function routeCreateGithubHook(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeCreateGithubHook'")

  let cn = await getCn(subdomain)
  let account = await getAccountById(cn, sessionData.accountId)

  if (!account || account.role !== "admin")
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  let cleanData = await validate(data, routeCreateHookSchemata)
  let token = crypto.randomBytes(8).toString("hex")
  let cmd = insert("hook", {
    "secret": cleanData.secret,
    "provider": "Github",
    "token": token
  })

  await cn.execSqlBricks(cmd)

  return {
    done: true,
    token
  }
}

export async function routeGenerateSecret(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeGenerateSecret'")

  let cn = await getCn(subdomain)
  let account = await getAccountById(cn, sessionData.accountId)

  if (!account || account.role !== "admin")
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  return {
    done: true,
    secret: crypto.randomBytes(tokenSize).toString("hex")
  }
}

export async function routeProcessGithubNotification(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  let ts = Date.now()

  if (!req || !res)
    throw new Error("Missing request or response object in route.")
  if (!req.body || typeof req.body !== "string")
    throw new Error("Missing 'rawBody' in request.")

  let hookEvent = req.headers["x-github-event"]
  if (!hookEvent || typeof hookEvent !== "string" || hookEvent !== "push")
    throw new Error("Unsupported hook event")

  let token = req.params.hookId
  if (!token || !isHexString(token))
    throw new Error("Invalid URL")

  let cn = await getCn(subdomain)
  let secret = await getGithubHookToken(cn, token)

  if (!secret)
    throw new Error("No Github hook found") // FIXME: return 404 status code instead.

  let reqDigest = req.headers["x-hub-signature"]
  if (!reqDigest || typeof reqDigest !== "string")
    throw new Error("Invalid digest")

  let digest = crypto.createHmac("sha1", token).update(req.body).digest("hex")
  if (reqDigest !== digest)
    throw new Error("Invalid message digest")

  let cleanData = await validate(data, pushDataSchemata)
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

async function getGithubHookToken(runner: QueryRunnerWithSqlBricks, token: string) {
  let query = select("activated, secret").from("options").where({ "provider": "Github", "token": token })
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
