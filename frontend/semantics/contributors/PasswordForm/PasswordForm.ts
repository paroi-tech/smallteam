import { PublicDash, Dash, Log } from "bkb"
import { render } from "monkberry"
import directives from "monkberry-directives"
import { Model, ContributorModel } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import config from "../../../../isomorphic/config"

const template = require("./PasswordForm.monk")

export default class PasswordForm {
  readonly el: HTMLElement

  private passwordEl: HTMLInputElement
  private newPasswordEl: HTMLInputElement
  private passwordConfirmEl: HTMLInputElement
  private submitSpinnerEl: HTMLElement

  private view: MonkberryView

  private log: Log

  private state = {
    ctrl: {
      submit: () => this.onSubmit(),
      cancel: () => this.onCancel()
    }
  }

  private model: Model

  constructor(private dash: Dash<App>, private contributor: ContributorModel) {
    this.model = this.dash.app.model
    this.el = this.createView()
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"), { directives })

    let el = this.view.nodes[0] as HTMLElement
    this.passwordEl = el.querySelector(".js-password") as HTMLInputElement
    this.newPasswordEl = el.querySelector(".js-new-password") as HTMLInputElement
    this.passwordConfirmEl = el.querySelector(".js-password-confirm") as HTMLInputElement
    this.submitSpinnerEl = el.querySelector(".fa-spinner") as HTMLElement

    this.view.update(this.state)

    return el
  }

  private async onSubmit() {
    if (this.passwordEl.value.length === 0) {
      alert("Please enter your current password")
      this.passwordEl.focus()
      return
    }

    if (this.newPasswordEl.value.length === 0) {
      alert("Please enter new password")
      this.newPasswordEl.focus()
      return
    }

    if (this.newPasswordEl.value !== this.passwordConfirmEl.value) {
      alert("Passwords don't match")
      this.passwordConfirmEl.focus()
      return
    }

    await this.doPasswordUpdate(this.passwordEl.value, this.newPasswordEl.value)
  }

  private async doPasswordUpdate(currentPassword: string, newPassword: string) {
    this.submitSpinnerEl.style.display = "inline"
    try {
      let response = await fetch(`${config.urlPrefix}/api/session/change-password`, {
        method: "post",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (!response.ok) {
        this.log.warn("Password change request was not processed by server.")
        alert("Error. Request was not processed by server.")
      }
      else {
        let result = await response.json()
        if (result.done)
          alert("Password successfully updated.")
        else
          alert("Password was not changed. Maybe you mistyped your current password.")
      }
    } catch (err) {
      this.log.error("Error while updating password.", err)
    }
    this.submitSpinnerEl.style.display = "none"
  }

  private onCancel() {
    this.passwordEl.value = ""
    this.newPasswordEl.value = ""
    this.passwordConfirmEl.value = ""
  }

}
