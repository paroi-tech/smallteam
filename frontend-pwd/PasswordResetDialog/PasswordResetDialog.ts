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
    this.el = this.createView()
    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  public open() {
    this.el.showModal()
  }

  private createView() {
    this.view = render(template, document.createElement("div"))
    let el = this.view.nodes[0] as HTMLDialogElement

    this.passwordEl = el.querySelector(".js-password") as HTMLInputElement
    this.passwordConfirmEl = el.querySelector(".js-confirm") as HTMLInputElement
    this.submitBtnEl = el.querySelector(".js-submit-btn") as HTMLButtonElement
    this.spinnerEl = el.querySelector(".js-spinner") as HTMLElement
    this.submitBtnEl.addEventListener("click", ev => this.onSubmit())

    el.addEventListener("keyup", ev => {
      if (ev.key === "Enter")
        this.submitBtnEl.click()
    })
    document.body.appendChild(el)

    return el
  }

  private async onSubmit() {
    let password = this.passwordEl.value
    let d = this.dash.create(InfoDialog)

    if (password.length < 8 || password.length > 32) {
      await d.show("Password should have at least 8 characters and at most 32 characters.")
      this.passwordEl.focus()
      return
    }

    if (this.passwordConfirmEl.value !== password) {
      await d.show("Passwords do not match.")
      this.passwordConfirmEl.focus()
      return
    }

    this.spinnerEl.style.display = "inline"
    await this.doPasswordChange(password)
    this.spinnerEl.style.display = "none"
  }

  private async doPasswordChange(password: string) {
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
        return
      }

      let result = await response.json()
      let fn = () => window.location.href = `${config.urlPrefix}/index.html`
      if (result.done) {
        setTimeout(fn, 4000)
        await this.dash.create(InfoDialog).show("Password changed. You will be redirected to the login page.")
      } else {
        await this.dash.create(InfoDialog).show(`Sorry. Impossible to change your password. ${result.reason}`)
      }
    } catch (err) {
      await this.dash.create(ErrorDialog).show("Impossible to change the password. Error on server.")
      this.dash.app.log.warn(err)
    }
  }
}
