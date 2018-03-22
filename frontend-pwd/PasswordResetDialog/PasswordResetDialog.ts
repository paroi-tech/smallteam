import config from "../../isomorphic/config"
import { PublicDash, Dash } from "bkb"
import { render } from "monkberry"
import InfoDialog from "../../frontend/generics/modal-dialogs/InfoDialog/InfoDialog"
import ErrorDialog from "../../frontend/generics/modal-dialogs/ErrorDialog/ErrorDialog"

const template = require("./PasswordResetDialog.monk")

export default class LoginDialog {
  readonly el: HTMLDialogElement

  private passwordEl: HTMLInputElement
  private passwordConfirmEl: HTMLInputElement
  private submitBtnEl: HTMLButtonElement
  private spinnerEl: HTMLElement

  private view: MonkberryView

  constructor(private dash: Dash, private contributorId: string, private token: string) {
    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLDialogElement

    this.passwordEl = this.el.querySelector(".js-password") as HTMLInputElement
    this.passwordConfirmEl = this.el.querySelector(".js-confirm") as HTMLInputElement
    this.submitBtnEl = this.el.querySelector(".js-submit-btn") as HTMLButtonElement
    this.spinnerEl = this.el.querySelector(".js-spinner") as HTMLElement
    this.submitBtnEl.addEventListener("click", ev => this.onSubmit())

    this.el.addEventListener("keyup", ev => {
      if ((ev as KeyboardEvent).key === "Enter")
        this.submitBtnEl.click()
    })
    document.body.appendChild(this.el)

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  public open() {
    this.el.showModal()
  }

  private async onSubmit() {
    let password = this.passwordEl.value

    if (password.length < 8 || password.length > 32) {
      await this.dash.create(InfoDialog).show(
        "Password should have at least 8 characters and at most 32 characters."
      )
      this.passwordEl.focus()
      return
    }

    if (this.passwordConfirmEl.value !== password) {
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
      let response = await fetch(`${config.urlPrefix}/reset-passwd`, {
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
