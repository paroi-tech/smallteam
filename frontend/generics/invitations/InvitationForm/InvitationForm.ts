import { render } from "@fabtom/lt-monkberry"
import { Dash } from "bkb"
import config from "../../../../isomorphic/config"
import ErrorDialog from "../../modal-dialogs/ErrorDialog/ErrorDialog"
import WarningDialog from "../../modal-dialogs/WarningDialog/WarningDialog"

const template = require("./InvitationForm.monk")

export default class InvitationForm {
  readonly el: HTMLElement
  private usernameEl: HTMLInputElement
  private emailEl: HTMLInputElement
  private validityEl: HTMLInputElement
  private spinnerEl: HTMLElement

  constructor(private dash: Dash) {
    let view = render(template)
    this.el = view.rootEl()
    this.usernameEl = view.ref("username")
    this.emailEl = view.ref("email")
    this.validityEl = view.ref("validity")
    this.spinnerEl = view.ref("spinner")
    view.ref("submitBtn").addEventListener("click", ev => this.onSubmit())
  }

  private async onSubmit() {
    let username = this.usernameEl.value.trim()
    let email = this.emailEl.value
    let validity = this.validityEl.value
    if (!this.validate(username, email, validity)) {
      await this.dash.create(WarningDialog).show("Please check the values you type in the form.")
      return
    }
    await this.doFetch(username || undefined, email, validity)
  }

  private async doFetch(username: string | undefined, email: string, validity) {
    try {
      let response = await fetch(`${config.urlPrefix}/api/registration/send-invitation`, {
        method: "post",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, validity })
      })
      if (response.ok)
        return this.handleFetchResult(await response.json())
      else
        await this.dash.create(ErrorDialog).show(`The server does not handle your request: ${response.status} code.`)
    } catch (error) {
      await this.dash.create(ErrorDialog).show("Unable to complete the task. Network Error.")
    }
  }

  private async handleFetchResult(data) {
    if (!data.done) {
      await this.dash.create(ErrorDialog).show(`The server does not fulfill your request for an unknown reason.`)
      return
    }
    this.clear()
    // FIXME: In future, this event will be received via websocket.
    this.dash.emit("invitationSent", data.invitation)
  }

  private validate(username: string, email: string, validity: string) {
    if (username !== "" && (username.length < 4 || username.length > 30))
      return false
    if (email === "")
      return false
    let n = parseInt(validity)
    if (n <= 0 || n > 30)
      return false
    return true
  }

  private clear() {
    this.usernameEl.value = ""
    this.emailEl.value = ""
    this.validityEl.value = "1"
  }
}
