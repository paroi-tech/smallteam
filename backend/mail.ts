import { randomBytes } from "crypto"
import { cn } from "./utils/dbUtils"
import config from "../isomorphic/config"
import { createTransport, getTestMessageUrl } from "nodemailer"
import { buildSelect, buildUpdate, buildDelete } from "./utils/sql92builder/Sql92Builder"

export const tokenMaxValidity = 7 * 24 * 3600 // 7 days

const account = {
  user: "ulvmvwmr3qhn2wec@ethereal.email",
  password: "xPzcufKPHhWTnkNRMe"
}

export async function sendMail(to: string, subject: string, text: string, html: string): Promise<{ done: boolean, error?: any }> {
  let result = {
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
      from: "smallteambot@smallteam.bj", to, subject, text, html
    }

    let info = await transporter.sendMail(opts)
    // TODO: Remove these two lines.
    console.log(`Mail sent: ${info.messageId}`)
    console.log(`Preview URL: ${getTestMessageUrl(info)}`)

    result.done = true
  } catch (error) {
    result.error = error
  }

  return result
}

export async function removeExpiredRegistrationTokens() {
  try {
    let s = "delete from reg_pwd where create_ts - current_timestamp > $duration"
    await cn.exec(s, {
      $duration: tokenMaxValidity
    })
  } catch (err) {
    console.log("Error while removing expired account activation tokens", err)
  }
}
