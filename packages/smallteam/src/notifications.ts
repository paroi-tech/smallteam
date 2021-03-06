import Joi from "@hapi/joi"
import { SBConnection } from "@ladc/sql-bricks-modifier"
import crypto from "crypto"
import { Request, Response } from "express"
import { deleteFrom, insert, select, update } from "sql-bricks"
import { v4 as uuidv4 } from "uuid"
import { appLog, TOKEN_LENGTH } from "./context"
import { hasAdminRights, SessionData } from "./session"
import { getCn, strVal } from "./utils/dbUtils"
import { validate, validateWithOptions } from "./utils/joiUtils"
import { AuthorizationError, getTeamSiteUrl } from "./utils/serverUtils"

const commitSchema = Joi.object().keys({
  id: Joi.string().hex().required(),
  message: Joi.string().default(""),
  author: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required(),
    username: Joi.string().required()
  }),
  url: Joi.string().uri(),
  distinct: Joi.boolean().required(),
  timestamp: Joi.date().required()
})

const pushDataSchema = Joi.object().keys({
  ref: Joi.string().required(),
  before: Joi.string().required(),
  commits: Joi.array().items(commitSchema)
})

const schemaForSubscriptionId = Joi.object().keys({
  subscriptionId: Joi.string().regex(/\d+/).required()
})

export async function routeCreateGithubWebhook(subdomain: string, data: any, sessionData?: SessionData) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeCreateGithubWebhook'")

  const cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  const secret = crypto.randomBytes(TOKEN_LENGTH).toString("hex")
  const uuid = uuidv4()
  const sql = insert("git_subscription", {
    secret,
    "provider": "Github",
    "subscription_uuid": uuid
  })
  const execResult = await cn.exec(sql)
  const subscriptionId = execResult.getInsertedIdAsString()
  const teamSiteUrl = getTeamSiteUrl({ subdomain })
  const webhook = {
    id: subscriptionId,
    provider: "Github",
    active: true,
    url: `${teamSiteUrl}/api/notifications/github/webhook/${uuid}`
  }

  return {
    done: true,
    webhook
  }
}

export async function routeGetGithubWebhookSecret(subdomain: string, data: any, sessionData?: SessionData) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeGetGithubWebhookSecret'")

  const cleanData = await validate(data, schemaForSubscriptionId)
  const cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  const sql = select("secret").from("git_subscription").where({
    "provider": "Github",
    "subscription_id": cleanData.subscriptionId
  })
  const secret = await cn.singleValue(sql)

  return {
    done: true,
    secret
  }
}

export async function routeActivateGithubWebhook(subdomain: string, data: any, sessionData?: SessionData) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeActivateGithubWebhook'")

  const cleanData = await validate(data, schemaForSubscriptionId)
  const cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  const sql = update("git_subscription", { "active": 1 }).where({ "subscription_id": cleanData.subscriptionId })

  await cn.exec(sql)

  return {
    done: true
  }
}

export async function routeDeactivateGithubWebhook(subdomain: string, data: any, sessionData?: SessionData) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeDeactivateGithubWebhook'")

  const cleanData = await validate(data, schemaForSubscriptionId)
  const cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  const sql = update("git_subscription", { "active": 0 }).where({ "subscription_id": cleanData.subscriptionId })

  await cn.exec(sql)

  return {
    done: true
  }
}

export async function routeDeleteGithubWebhook(subdomain: string, data: any, sessionData?: SessionData) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeDeleteGithubWebhook'")

  const cleanData = await validate(data, schemaForSubscriptionId)
  const cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  const sql = deleteFrom("git_subscription").where({ "subscription_id": cleanData.subscriptionId })

  await cn.exec(sql)

  return {
    done: true
  }
}

export async function routeFetchGithubWebhooks(subdomain: string, data: any, sessionData?: SessionData) {
  if (!sessionData)
    throw new Error("Missing session data in 'routeFetchGithubWebhooks'")

  const cn = await getCn(subdomain)

  if (!await hasAdminRights(cn, sessionData))
    throw new AuthorizationError("Only admins are allowed to access this ressource.")

  const sql = select().from("git_subscription").where({ "provider": "Github" }) // FIXME: create index on provider column?
  const rs = await cn.all(sql)
  const webhooks = [] as any[]
  const teamSiteUrl = getTeamSiteUrl({ subdomain })

  for (const row of rs) {
    webhooks.push({
      id: strVal(row["subscription_id"]),
      provider: row["provider"],
      url: `${teamSiteUrl}/api/notifications/github/webhook/${row["subscription_uuid"]}`,
      active: row["active"] !== 0
    })
  }

  return {
    done: true,
    webhooks
  }
}

export async function routeProcessGithubNotification(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req || !res)
    throw new Error("Missing request or response object in 'routeProcessGithubNotification'.")

  const reqBody = req["rawBody"]
  if (!reqBody || typeof reqBody !== "string")
    throw new Error("Missing 'rawBody' attribute in request.")

  const event = req.headers["x-github-event"]
  if (!event || typeof event !== "string" || (event !== "push" && event !== "ping"))
    throw new Error("Unsupported hook event")

  const uuid = req.params.uuid
  if (!uuid)
    throw new Error("Invalid URL")

  const cn = await getCn(subdomain)
  const secret = await getActiveGithubHookSecret(cn, uuid)

  if (!secret)
    throw new Error("No Github hook found") // FIXME: return 404 status code instead.

  const reqDigest = req.headers["x-hub-signature"]
  if (!reqDigest || typeof reqDigest !== "string")
    throw new Error("Invalid digest")

  const digest = crypto.createHmac("sha1", secret).update(reqBody).digest("hex")
  const digestWithPrefix = "sha1=" + digest
  if (reqDigest !== digestWithPrefix)
    throw new Error("Invalid message digest")

  if (event === "ping") {
    appLog.info(`Received ping for Github Hook ${uuid} for subdomain ${subdomain}`, data)
    return "Ping received..."
  }

  const cleanData = await validateWithOptions(data, pushDataSchema, { allowUnknown: true })
  const deliveryGuid = getDeliveryGuid(req)
  const tcn = await cn.beginTransaction()

  try {
    for (const commit of cleanData.commits) {
      if (commit.distinct)
        await processCommit(tcn, commit, deliveryGuid)
    }
    await tcn.commit()
  } finally {
    if (tcn.inTransaction)
      await tcn.rollback()
  }

  appLog.info(`Processed push event hook with uuid ${deliveryGuid}`)

  return "Webhook successfully processed..."
}

async function getActiveGithubHookSecret(cn: SBConnection, uuid: string): Promise<string | undefined> {
  const sql = select("active, secret").from("git_subscription").where({ "provider": "Github", "subscription_uuid": uuid })
  const res = await cn.singleRow(sql)

  if (res && res["active"] !== 0)
    return res["secret"] as string
}

/**
 * What this does is:
 *  - save the commit in db,
 *  - search for task codes in the commit message,
 *  - and attach commit to the tasks.
 */
async function processCommit(cn: SBConnection, commit, deliveryGuid?: string) {
  const id = await saveCommit(cn, commit, deliveryGuid)
  const codes = getTaskCodesInCommitMessage(commit.message)

  for (const code of codes) {
    const taskId = await getTaskIdFromCode(cn, code)

    if (taskId)
      await addCommitToTask(cn, taskId, id)
  }
}

async function saveCommit(cn: SBConnection, commit, deliveryGuid?: string) {
  const sql = insert("git_commit", {
    "external_id": commit.id,
    "message": commit.message,
    "author_name": commit.author.username,
    "ts": commit.timestamp.getTime(),
    "commit_url": commit.url,
    "notification_id": deliveryGuid || null
  })
  const res = await cn.exec(sql)

  return res.getInsertedIdAsString()
}

function getDeliveryGuid(req) {
  const guid = req.headers["x-github-delivery"]

  if (guid && typeof guid === "string")
    return guid
}

function getTaskCodesInCommitMessage(message: string) {
  return message.match(/[a-zA-Z0-9]{1,}-[\d]+/g) || ([] as string[])
}

// function getProjectCodeFromTaskCode(taskCode: string) {
//   let arr = taskCode.split("-")

//   if (arr.length > 1)
//     return arr[0]
// }

async function getTaskIdFromCode(cn: SBConnection, code: string): Promise<string | undefined> {
  const sql = select("task_id").from("task").where({ code })
  const id = await cn.singleValue(sql)
  if (id)
    return strVal(id)
}

async function addCommitToTask(cn: SBConnection, taskId: string, commitId: string) {
  const sql = insert("git_commit_task", { "task_id": taskId, "commit_id": commitId })

  await cn.exec(sql)
}
