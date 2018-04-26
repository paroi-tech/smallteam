import { randomBytes } from "crypto"
import { cn } from "./utils/dbUtils"
import config from "../isomorphic/config"
import { createTransport, getTestMessageUrl } from "nodemailer"
import { getContributorByEmail } from "./dbqueries/queryContributor"
import { tokenSize } from "./backendConfig"
import { insert } from "sql-bricks"

export const tokenMaxValidity = 7 * 24 * 3600 // 7 days

const account = {
  user: "ulvmvwmr3qhn2wec@ethereal.email",
  password: "xPzcufKPHhWTnkNRMe"
}

export async function routeSendPasswordEmail(data: any) {
  if (!data || !data.email)
    throw new Error("Email is needed to send password reset token")

  let contributor = await getContributorByEmail(data.email)
  if (!contributor) {
    return {
      done: false,
      reason: "No contributor with the given email"
    }
  }

  generateAndSendPasswordResetToken(contributor.id, data.email).then(result => {
    if (!result.done) {
      console.log("Password reset request has not been completely processed:", result.reason)
    }
  })

  return {
    done: true
  }
}

async function generateAndSendPasswordResetToken(contributorId: string, address: string) {
  let token = randomBytes(tokenSize).toString("hex")
  let encodedToken = encodeURIComponent(token)
  let host = config.host
  // FIXME: Add URL param for action to take: reset password or user registration.
  let url  = `${host}${config.urlPrefix}/registration.html?action=passwordReset&token=${encodedToken}&uid=${contributorId}`
  let text = `We received a request to change your password.\nPlease follow this link ${url} if you made that request.`
  let html = `We received a request to change your password.<br>Please click <a href="${url}">here</a> if you made that request.`

  let result = await sendMail(address, "SmallTeam password reset", text, html)
  if (!result.done) {
    return {
      done: false,
      reason: result.error ? result.error.toString() : "Mail not sent"
    }
  }

  let b = await storePasswordResetToken(token, contributorId)
  return {
    done: b,
    reason: b ? "Unable to store token in database" : undefined
  }
}

async function storePasswordResetToken(token: string, contributorId: string) {
  let query = insert("reg_pwd", {
    "contributor_id": contributorId,
    "token": token
  })

  try {
    await cn.execSqlBricks(query)
    return true
  } catch (error) {
    return false
  }
}

export async function sendMail(to: string, subject: string, text: string, html: string) {
  let result: any = {
    done: false,
    error: undefined
  }

  try {
    let transporter = await createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.password
      }
    })

    let opts = {
      from: "smallteambot@smallteam.bj",
      to,
      subject,
      text,
      html
    }

    let info = await transporter.sendMail(opts)
    result.done = true
  } catch (error) {
    result.error = error
  }

  return result
}

export function validateEmail(email: string): boolean {
  // Email validation regex found @:
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#Validation
  let pattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return pattern.test(email)
}

export async function removeExpiredRegistrationTokens() {
  try {
    await cn.exec("delete from reg_pwd where create_ts - current_timestamp > $duration", {
      $duration: tokenMaxValidity
    })
  } catch (err) {
    console.log("Error while removing expired account activation tokens", err)
  }
}
