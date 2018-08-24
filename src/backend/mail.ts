import { createTestAccount, createTransport, getTestMessageUrl } from "nodemailer"
import { config } from "./backendConfig"
import { log } from "./utils/log"

async function getSettings() {
  if (config.env === "prod")
    return config.mail

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

export async function sendMail(to: string, subject: string, text: string, html: string) {
  let settings = await getSettings()
  if (!settings) {
    return {
      done: false,
      errorMsg: "Cannot retrieve mail account"
    }
  }

  let answer = { done: false } as any
  try {
    // https://nodemailer.com/transports/sendmail/
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

    answer.done = true

    if (config.env === "local")
      log.info("[LOCAL ENV] Mail sent:", info.messageId, "Preview URL:", getTestMessageUrl(info))
  } catch (error) {
    answer.errorMsg = error.message
  }

  return answer
}
