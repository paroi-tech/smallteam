require("./_PasswordResetDialog.scss")
import { render } from "@tomko/lt-monkberry"
import { Dash } from "bkb"
import ErrorDialog from "../../../shared-ui/modalDialogs/ErrorDialog/ErrorDialog"
import InfoDialog from "../../../shared-ui/modalDialogs/InfoDialog/InfoDialog"
import PasswordEdit from "../../../shared-ui/PasswordEdit/PasswordEdit"
import { whyNewPasswordIsInvalid } from "../../../shared/libraries/helpers"
import App from "../App/App"

const template = require("./PasswordResetDialog.monk")

export interface PasswordResetDialogOptions {
  accountId: string
  token: string
}

export default class PasswordResetDialog {
  readonly el: HTMLDialogElement
  private spinnerEl: HTMLElement

  private edit: PasswordEdit

  constructor(private dash: Dash<App>, private options: PasswordResetDialogOptions) {
    let view = render(template)

    this.el = view.rootEl()
    this.spinnerEl = view.ref("spinner")

    this.edit = this.dash.create(PasswordEdit)
    view.ref("container").appendChild(this.edit.el)

    let btnEl: HTMLButtonElement = view.ref("submitBtn")

    btnEl.addEventListener("click", () => this.onSubmit())
    this.el.addEventListener("keyup", (ev: KeyboardEvent) => {
      if (ev.key === "Enter")
        this.onSubmit()
    })

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  open() {
    document.body.appendChild(this.el)
    this.el.showModal()
  }

  private async onSubmit() {
    let password = this.edit.getPasswordIfMatch()

    if (password === undefined) {
      await this.dash.create(InfoDialog).show("Passwords do not match.")
      this.edit.focus()
      return
    }

    let checkMsg = whyNewPasswordIsInvalid(password)

    if (checkMsg) {
      await this.dash.create(InfoDialog).show(checkMsg)
      this.edit.focus()
      return
    }

    this.spinnerEl.hidden = false
    await this.doPasswordChange(password)
    this.spinnerEl.hidden = true
  }

  private async doPasswordChange(password: string) {
    try {
      if (await this.doFetch(password)) {
        let fn = () => window.location.href = `${this.dash.app.baseUrl}/`
        setTimeout(fn, 4000)
        await this.dash.create(InfoDialog).show("Password changed. You will be redirected to the login page.")
      }
    } catch (err) {
      await this.dash.create(ErrorDialog).show("Impossible to change the password. Error on server.")
      this.dash.app.log.warn(err)
    }
  }

  private async doFetch(password: string) {
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/registration/reset-password`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          accountId: this.options.accountId,
          token: this.options.token,
          password
        })
      })

      if (!response.ok) {
        await this.dash.create(ErrorDialog).show("Unable to get a response from server.")
        return false
      }

      let data = await response.json()

      if (!data.done) {
        await this.dash.create(InfoDialog).show(`Sorry. Impossible to change your password. ${data.reason}`)
        return false
      }
    } catch (err) {
      await this.dash.create(ErrorDialog).show("Impossible to change the password. Error on server.")
      return false
    }

    return true
  }
}