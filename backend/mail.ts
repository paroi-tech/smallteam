import { randomBytes } from "crypto"
import config from "../isomorphic/config"
import { createTransport, getTestMessageUrl } from "nodemailer"
import { buildSelect, buildUpdate } from "./utils/sql92builder/Sql92Builder"

const account = {
  user: "vutj6mmpseil725f@ethereal.email",
  password: "xNGuRQs1yNmXK4vPJM"
}

export async function sendActivationMail(email: string): Promise<{ done: boolean, token?: string }> {
  try {
    let token = randomBytes(64).toString("hex")

    let transporter = await createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.password
      }
    })

    let url = "http://localhost:3921" + config.urlPrefix + "/set-password?token=" + token
    let mailOptions = {
      from: "smallteambot@smallteam.com",
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
