import config from "../../isomorphic/config"
import { PublicDash, Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import InfoDialog from "../../frontend/generics/modalDialogs/InfoDialog/InfoDialog"
import ErrorDialog from "../../frontend/generics/modalDialogs/ErrorDialog/ErrorDialog"

const template = require("./PasswordResetDialog.monk")

export default class LoginDialog {
  readonly el: HTMLDialogElement
  private passwordEl: HTMLInputElement
  private passwordConfirmEl: HTMLInputElement
  private spinnerEl: HTMLElement

  constructor(private dash: Dash, private contributorId: string, private token: string) {
    let view = render(template)
    this.el = view.rootEl()
    this.passwordEl = view.ref("password")
    this.passwordConfirmEl = view.ref("confirm")
    this.spinnerEl = view.ref("spinner")

    let btnEl: HTMLButtonElement = view.ref("submitBtn")
    btnEl.addEventListener("click", ev => this.onSubmit())
    this.el.addEventListener("keyup", (ev: KeyboardEvent) => {
      if (ev.key === "Enter")
        btnEl.click()
    })

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  public open() {
    document.body.appendChild(this.el)
    this.el.showModal()
  }

  private async onSubmit() {
    let password = this.passwordEl.value.trim()

    if (password.length < config.minPasswordLength) {
      await this.dash.create(InfoDialog).show(
        `Password should have at least ${config.minPasswordLength} characters.`
      )
      this.passwordEl.focus()
      return
    }

    if (this.passwordConfirmEl.value.trim() !== password) {
      await this.dash.create(InfoDialog).show("Passwords do not match.")
      this.passwordConfirmEl.focus()
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
        let fn = () => window.location.href = `${config.urlPrefix}/index.html`
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
      let response = await fetch(`${config.urlPrefix}/api/registration/reset-password`, {
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
