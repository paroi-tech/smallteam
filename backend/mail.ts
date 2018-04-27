import { createTransport } from "nodemailer"

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
