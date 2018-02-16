import { randomBytes } from "crypto"
import { cn } from "./utils/dbUtils"
import config from "../isomorphic/config"
import { createTransport, getTestMessageUrl } from "nodemailer"
import { buildSelect, buildUpdate, buildDelete } from "./utils/sql92builder/Sql92Builder"

export const tokenMaxValidity = 7 * 24 * 3600 // 7 days

const account = {
  user: "vutj6mmpseil725f@ethereal.email",
  password: "xNGuRQs1yNmXK4vPJM"
}

type MailResult = {
  done: boolean
  token?: string
}

export async function sendActivationMail(contributorId: string, email: string): Promise<MailResult> {
  let host = "http://localhost:3921"

  try {
    let token = randomBytes(16).toString("hex")

    let transporter = await createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.password
      }
    })

    let url = `${host}${config.urlPrefix}/reset-password.html?token=${encodeURIComponent(token)}&uid=${contributorId}`
    let mailOptions = {
      from: "smallteambot@smallteam.bj",
      to: email,
      subject: "Account activation",
      text: `Please follow the link ${url} to activate your account`,
      html: `Please follow <a href="${url}">link</a> to activate your account`
    }
    let info = await transporter.sendMail(mailOptions)

    // TODO: Remove these lines.
    console.log("Message sent: %s", info.messageId)
    console.log("Preview URL: %s", getTestMessageUrl(info))

    return {
      done: true,
      token
    }
  } catch (err) {
    console.error("Error while sending email", err)
  }

  return {
    done: false
  }
}

export async function removeExpiredTokens() {
  try {
    let s = "delete from mail_challenge where create_ts - current_timestamp > $duration"
    await cn.run(s, {
      $duration: tokenMaxValidity
    })
  } catch (err) {
    console.log("Error while removing expired account activation tokens", err)
  }
}
