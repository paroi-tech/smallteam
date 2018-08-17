import config from "../../isomorphic/config"
import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import PasswordEdit from "../../frontend/generics/PasswordEdit/PasswordEdit"
import InfoDialog from "../../frontend/generics/modalDialogs/InfoDialog/InfoDialog"
import ErrorDialog from "../../frontend/generics/modalDialogs/ErrorDialog/ErrorDialog"
import App from "../App/App";

const template = require("./PasswordResetDialog.monk")

export default class LoginDialog {
  readonly el: HTMLDialogElement
  private spinnerEl: HTMLElement

  private edit: PasswordEdit

  constructor(private dash: Dash<App>, private contributorId: string, private token: string) {
    let view = render(template)
    this.el = view.rootEl()
    this.spinnerEl = view.ref("spinner")

    this.edit = this.dash.create(PasswordEdit)
    view.ref("container").appendChild(this.edit.el)

    let btnEl: HTMLButtonElement = view.ref("submitBtn")
    btnEl.addEventListener("click", ev => this.onSubmit())
    this.el.addEventListener("keyup", (ev: KeyboardEvent) => {
      if (ev.key === "Enter")
        this.onSubmit()
    })

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  public open() {
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

    if (password.length < config.minPasswordLength) {
      let msg = `Password should have at least ${config.minPasswordLength} characters.`
      await this.dash.create(InfoDialog).show(msg)
      this.edit.focus()
      return
    }

    this.spinnerEl.style.display = "inline"
    await this.doPasswordChange(password)
    this.spinnerEl.style.display = "none"
  }

  private async doPasswordChange(password: string) {
    try {
      let b = await this.doFetch(password)
      if (b) {
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
    let result = false

    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/registration/reset-password`, {
        method: "post",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contributorId: this.contributorId,
          token: this.token,
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
