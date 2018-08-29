import { TOKEN_LENGTH } from "./backendConfig"
import { Request, Response } from "express"
import { SessionData, hasAdminRights } from "./session"
import { getCn } from "./utils/dbUtils"
import { select, insert, update, deleteFrom } from "sql-bricks"
import { QueryRunnerWithSqlBricks } from "mycn-with-sql-bricks"
import { AuthorizationError, getTeamSiteUrl } from "./utils/serverUtils"
import { log } from "./utils/log"
import validate from "./utils/joiUtils"
import Joi = require("joi")
import uuidv4 = require("uuid/v4")
import crypto = require("crypto")

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

let schemaForSubscriptionId = Joi.object().keys({
  subscriptionId: Joi.string().regex(/\d+/).required()
})

export async function routeCreateGithubHook(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeCreateGithubHook'")

  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  let secret = crypto.randomBytes(TOKEN_LENGTH).toString("hex")
  let uuid = uuidv4()
  let sql = insert("git_subscription", {
    "secret": secret,
    "provider": "Github",
    "subscription_uuid": uuid
  })
  let execResult = await cn.execSqlBricks(sql)
  let subscriptionId = execResult.getInsertedIdString()
  let teamSiteUrl = getTeamSiteUrl({ subdomain })
  let hook = {
    id: subscriptionId,
    provider: "Github",
    active: true,
    url: `${teamSiteUrl}/api/notifications/github/hook/${uuid}`
  }

  return {
    done: true,
    hook
  }
}

export async function routeGetGithubHookSecret(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeGetGithubHookSecret'")

  let cleanData = await validate(data, schemaForSubscriptionId)
  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  let sql = select("secret").from("git_subscription").where({
    "provider": "Github",
    "subscription_id": cleanData.subscriptionId
  })
  let secret = await cn.singleValueSqlBricks(sql)

  return {
    done: true,
    secret
  }
}

export async function routeActivateGithubHook(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeActivateGithubHook'")

  let cleanData = await validate(data, schemaForSubscriptionId)
  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  let sql = update("git_subscription", { "active": 1 }).where({ "subscription_id": cleanData.subscriptionId })

  await cn.execSqlBricks(sql)

  return {
    done: true
  }
}

export async function routeDeactivateGithubHook(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeDeactivateGithubHook'")

  let cleanData = await validate(data, schemaForSubscriptionId)
  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  let sql = update("git_subscription", { "active": 0 }).where({ "subscription_id": cleanData.subscriptionId })

  await cn.execSqlBricks(sql)

  return {
    done: true
  }
}

export async function routeDeleteGithubHook(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeDeleteGithubHook'")

  let cleanData = await validate(data, schemaForSubscriptionId)
  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  let sql = deleteFrom("git_subscription").where({ "subscription_id": cleanData.subscriptionId })

  await cn.execSqlBricks(sql)

  return {
    done: true
  }
}

export async function routeFetchGithubHooks(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
  throw new Error("Missing session data in 'routeGenerateSecret'")

  let cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  let sql = select().from("git_subscription").where({ "provider": "Github" }) // FIXME: create index on provider column?
  let rs = await cn.allSqlBricks(sql)
  let hooks = [] as any[]
  let teamSiteUrl = getTeamSiteUrl({ subdomain })

  for (let row of rs) {
    hooks.push({
      id: row["subscription_id"].toString(),
      provider: row["provider"],
      url: `${teamSiteUrl}/api/notifications/github/hook/${row["subscription_uuid"]}`,
      active: row["active"] != 0
    })
  }

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
  if (!reqBody || typeof reqBody !== "string")
    throw new Error("Missing 'rawBody' attribute in request.")

  let event = req.headers["x-github-event"]
  if (!event || typeof event !== "string" || (event !== "push" && event !== "ping"))
    throw new Error("Unsupported hook event")

  let uuid = req.params.uuid
  if (!uuid)
    throw new Error("Invalid URL")

  let cn = await getCn(subdomain)
  let secret = await getActiveGithubHookSecret(cn, uuid)

  if (!secret)
    throw new Error("No Github hook found") // FIXME: return 404 status code instead.

  let contentDigest = req.headers["x-hub-signature"]
  if (!contentDigest || typeof contentDigest !== "string")
    throw new Error("Invalid digest")

  let computedDigest = crypto.createHmac("sha1", uuid).update(reqBody).digest("hex")
  if (contentDigest !== computedDigest)
    throw new Error("Invalid message digest")

  if (event === "push") {
    log.info(`Received ping for Github hook ${uuid}`, data)
    return "Ping received..."
  }

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

async function getActiveGithubHookSecret(cn: QueryRunnerWithSqlBricks, uuid: string) {
  let sql = select("active, secret").from("git_subscription").where({ "provider": "Github", "subscription_uuid": uuid })
  let res = cn.singleRowSqlBricks(sql)

  if (res && res["active"] != 0)
    return res["secret"]
}

/**
 * What this does is:
 *  - save the commit in db,
 *  - search for task codes in the commit message,
 *  - and attach commit to the tasks.
 */
async function processCommit(cn: QueryRunnerWithSqlBricks, commit, ts: number, deliveryGuid?: string) {
  let commitId = await saveCommit(cn, commit, ts, deliveryGuid)

  for (let taskCode of getTaskCodesInCommitMessage(commit.message)) {
    let taskId = await getTaskIdFromCode(cn, taskCode)

    if (taskId)
      addCommitToTask(cn, taskId, commitId)
  }
}

async function saveCommit(cn: QueryRunnerWithSqlBricks, commit, ts: number, deliveryGuid?: string) {
  let sql = insert("git_commit", {
    "external_id": commit.sha,
    "message": commit.message,
    "author_name": commit.author.name,
    "ts": ts,
    "notification_id": deliveryGuid || null
  })
  let res = await cn.execSqlBricks(sql)

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

async function getTaskIdFromCode(cn: QueryRunnerWithSqlBricks, code: string) {
  let sql = select("task_id").from("task").where({ code })
  let res = cn.singleValueSqlBricks(sql)

  if (res)
    return res.toString()
}

async function addCommitToTask(cn: QueryRunnerWithSqlBricks, taskId: string, commitId: string) {
  let sql = insert("git_commit_task", { "task_id": taskId, "commit_id": commitId })

  await cn.execSqlBricks(sql)
}
