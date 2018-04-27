import { randomBytes } from "crypto"
import { Request, Response } from "express"
import { cn } from "./utils/dbUtils"
import { select, insert, update, deleteFrom } from "sql-bricks"
import { sendMail, validateEmail } from "./mail"
import { tokenSize } from "./backendConfig"
import { getContributorById } from "./utils/userUtils"
import { SessionData } from "./session"

export async function routeSendInvitation(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData || !data || !data.email || typeof data.email !== "string" ||
    (data.username && typeof data.username !== "string"))
    throw new Error("Required parameter missing in route callback")

  let contributor = await getContributorById(sessionData.contributorId)
  if (!contributor || contributor.role !== "admin")
    throw new Error("User is not allowed to perform this task")

  if (!validateEmail(data.email)) {
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
