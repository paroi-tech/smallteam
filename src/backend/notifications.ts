import * as crypto from "crypto"
import { Request, Response } from "express"
import { SessionData } from "./session"
import { getCn } from "./utils/dbUtils"
import { select } from "sql-bricks"
import { QueryRunnerWithSqlBricks } from "mycn-with-sql-bricks"
import Joi = require("joi")

const hookTokenSize = 8

export async function routeProcessGithubNotification(subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req || !res)
    throw new Error("Missing request or response object in route.")
  if (!req.body || typeof req.body !== "string")
    throw new Error("Missing 'rawBody' in request.")

  let token = req.params.hookId
  if (!token || Joi.validate(token, Joi.string().hex()))
    throw new Error("Invalid URL")

  let cn = await getCn(subdomain)
  let secret = await getGithubHookToken(cn, token)

  if (!secret)
    throw new Error("No token Github found")

  let hmac = crypto.createHmac("sha1", token).update(req.body)
}

async function getGithubHookToken(runner: QueryRunnerWithSqlBricks, token: string) {
  let query = select("secret").from("options").where({ "provider": "github", "token": token })

  return await runner.singleValueSqlBricks(query)
}
