import { createTestAccount, createTransport, getTestMessageUrl } from "nodemailer"
import { serverConfig } from "./backendConfig"

interface ActionResult {
  done: boolean
  errorMsg?: string
}

async function getSettings() {
  if (serverConfig.env === "prod")
    return serverConfig.mail

  try {
    let testAccount = await createTestAccount()
    return {
      from: "smallteambot@smallteam.io",
      user: testAccount.user,
      password: testAccount.pass,
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure
    }
  } catch (error) {
    return undefined
  }
}

export async function sendMail(to: string, subject: string, text: string, html: string): Promise<ActionResult> {
  let settings = await getSettings()
  if (!settings) {
    return {
      done: false,
      errorMsg: "Cannot retrieve mail account"
    }
  }

  let rs: ActionResult = { done: false }
  try {
// let transporter = createTransport({
//     sendmail: true,
//     newline: 'unix',
//     path: '/usr/sbin/sendmail'
// });
    let transporter = createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: {
        user: settings.user,
        pass: settings.password
      }
    })
    let info = await transporter.sendMail({
      from: settings.from, to, subject, text, html
    })

    rs.done = true
    if (serverConfig.env === "local") {
      console.log("Mail sent:", info.messageId)
      console.log("Preview URL:", getTestMessageUrl(info))
    }
  } catch (error) {
    rs.errorMsg = error.message
  }

  return rs
}
