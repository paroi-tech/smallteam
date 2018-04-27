import { randomBytes } from "crypto"
import { Request, Response } from "express"
import { cn } from "./utils/dbUtils"
import { select, insert, update, deleteFrom } from "sql-bricks"
import { sendMail } from "./mail"
import { tokenSize } from "./backendConfig"
import { getContributorById } from "./utils/userUtils"
import { SessionData } from "./session"
import * as Joi from "joi"

export async function routeSendInvitation(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeSendInvitation'")
  let contributor = await getContributorById(sessionData.contributorId)
  if (!contributor || contributor.role !== "admin")
    throw new Error("User is not allowed to perform this task")

  let schema = Joi.object().keys({
    username: Joi.string(),
    email: Joi.string().email().required()
  })
  try {
    await schema.validate(data)
  } catch (error) {
    return {
      done: false,
      reason: "Invalid email address"
    }
  }

  let token = randomBytes(tokenSize)
  let query = insert("reg_new", {
    email: data.email
  })
}
