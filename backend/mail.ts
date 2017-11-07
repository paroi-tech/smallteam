import { createTestAccount, createTransport, getTestMessageUrl } from "nodemailer"

const account = {
  user: "vutj6mmpseil725f@ethereal.email",
  password: "xNGuRQs1yNmXK4vPJM"
}

export async function sendActivationMail(contributorId: string, contributorEmail: string) {
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

    let mailOptions = {
      from: "smallteambot@smallteam.com",
      to: contributorEmail,
      subject: "Account activation",
      text: "Please follow link to activate your account",
      html: `Please follow <a href="#">link</a> to activate your account`
    }

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions)

    console.log("Message sent: %s", info.messageId)
    console.log("Preview URL: %s", getTestMessageUrl(info));
  } catch (err) {
    console.error("Error while sending email", err)
  }
}
