import { createTransport } from "nodemailer"
import { appLog, conf } from "./context"

export interface SendMail {
  done: boolean,
  errorMsg?: string
}

export interface MailOptions {
  from?: string,
  to: string,
  subject: string,
  html: string,
  text?: string
}

export async function sendMail(options: MailOptions): Promise<SendMail> {
  if (conf.env === "local") {
    appLog.info(`-----------------
To: ${options.to}
Subject: ${options.subject}
${options.html}
...
${options.text || htmlToText(options.html)}`)
    return {
      done: true
    }
  } else {
    try {
      // https://nodemailer.com/transports/sendmail/
      let transporter = createTransport({
        sendmail: true,
        newline: "unix",
        path: "/usr/sbin/sendmail"
      })
      await transporter.sendMail({
        from: options.from || conf.mail.from,
        to: options.to,
        subject: options.subject,
        text: options.text || htmlToText(options.html),
        html: options.html
      })
      return {
        done: true
      }
    } catch (error) {
      return {
        done: false,
        errorMsg: error.message
      }
    }
  }
}

const htmlToText = (function () {
  function replaceLinks(html) {
    return html.replace(/<a\s+.*?href="([^"]*)".*?>(.*?)<\/a>/gi, (_, url, label) => {
      return `${label} ( ${url} )`
    })
  }
  /**
   * Thanks to https://stackoverflow.com/a/430240/3786294
   */
  let tagBody = `(?:[^"'>]|"[^"]*"|'[^']*')*`
  let tagOrComment = new RegExp(
    "<(?:"
    // Comment body.
    + "!--(?:(?:-*[^->])*--+|-?)"
    // Special "raw text" elements whose content should be elided.
    + "|script\\b" + tagBody + ">[\\s\\S]*?</script\\s*"
    + "|style\\b" + tagBody + ">[\\s\\S]*?</style\\s*"
    // Regular name
    + "|/?[a-z]"
    + tagBody
    + ")>",
    "gi")
  function stripHtmlTags(html) {
    let oldHtml
    do {
      oldHtml = html
      html = html.replace(tagOrComment, "")
    } while (html !== oldHtml)
    return html.replace(/</g, "&lt;")
  }
  return function (html) {
    html = replaceLinks(html)
    return stripHtmlTags(html)
  }
})()
