import { cn } from "./utils/dbUtils"
import config from "../isomorphic/config"
import { createTransport, getTestMessageUrl } from "nodemailer"

export const tokenMaxValidity = 7 * 24 * 3600 // 7 days

const account = {
  user: "ulvmvwmr3qhn2wec@ethereal.email",
  password: "xPzcufKPHhWTnkNRMe"
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
