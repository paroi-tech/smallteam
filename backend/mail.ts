import { createTransport, getTestMessageUrl } from "nodemailer"

const account = {
  user: "ulvmvwmr3qhn2wec@ethereal.email",
  password: "xPzcufKPHhWTnkNRMe"
}

const from = "smallteambot@smallteam.bj"

type SendMailResult = {
  done: boolean
  errorMsg?: string
}

export async function sendMail(to: string, subject: string, text: string, html: string): Promise<SendMailResult> {
  let result: SendMailResult = {
    done: false
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
      from, to, subject, text, html
    }

    let info = await transporter.sendMail(opts)
    result.done = true

    // FIXME: remove these lines before going in production.
    console.log("Mail sent:", info.messageId);
    console.log("Preview URL:", getTestMessageUrl(info));
  } catch (error) {
    result.errorMsg = error.message
  }

  return result
}
