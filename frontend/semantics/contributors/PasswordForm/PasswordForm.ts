import { PublicDash, Dash, Log } from "bkb"
import { Model, ContributorModel } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import config from "../../../../isomorphic/config"
import InfoDialog from "../../../generics/modalDialogs/InfoDialog/InfoDialog"
import ErrorDialog from "../../../generics/modalDialogs/ErrorDialog/ErrorDialog"
import { OwnDash } from "../../../App/OwnDash"
import { render, LtMonkberryView } from "@fabtom/lt-monkberry"

const template = require("./PasswordForm.monk")

export default class PasswordForm {
  readonly el: HTMLElement
  private prevPwdEl: HTMLInputElement
  private newPwdEl: HTMLInputElement
  private newPwd2El: HTMLInputElement
  private spinnerEl: HTMLElement

  private view: LtMonkberryView

  private log: Log
  private model: Model

  private state = {
    prevPwd: "",
    newPwd: "",
    newPwd2: ""
  }

  constructor(private dash: OwnDash, private contributor: ContributorModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.view = render(template)
    this.el = this.view.rootEl()
    this.prevPwdEl = this.view.ref("prevPwd")
    this.newPwdEl = this.view.ref("newPwd")
    this.newPwd2El = this.view.ref("newPwd2")
    this.spinnerEl = this.view.ref("spinner")

    this.view.ref("submitBtn").addEventListener("click", () => this.onSubmit())
    this.view.ref("cancelBtn").addEventListener("click", () => this.onCancel())

    this.view.update(this.state)
  }

  private async onSubmit() {
    let cleanData = await this.checkUserInput()
    if (!cleanData)
      return
    this.showSpinner()
    await this.doPasswordUpdate(cleanData.prevPasswd, cleanData.newPasswd)
    this.hideSpinner()
  }

  private async checkUserInput() {
    let d = this.dash.create(InfoDialog)

    if (this.prevPwdEl.value.length === 0) {
      await d.show("Please enter your current password")
      this.prevPwdEl.focus()
      return undefined
    }

    let prevPasswd = this.prevPwdEl.value.trim()
    if (prevPasswd.length < config.minPasswordLength) {
      await d.show(`Passwords should have at least ${config.minPasswordLength} characters`)
      this.prevPwdEl.focus()
      return undefined
    }

    if (this.newPwdEl.value.length === 0) {
      await d.show("Please enter new password")
      this.newPwdEl.focus()
      return undefined
    }

    let newPasswd = this.newPwdEl.value.trim()
    if (newPasswd.length < 8) {
      await d.show(`Passwords should have at least ${config.minPasswordLength} characters`)
      this.newPwdEl.focus()
      return undefined
    }

    if (newPasswd !== this.newPwd2El.value.trim()) {
      await d.show("Passwords don't match")
      this.newPwd2El.focus()
      return undefined
    }

    return { prevPasswd, newPasswd }
  }

  private async doPasswordUpdate(currentPassword: string, newPassword: string) {
    try {
      let response = await fetch(`${config.urlPrefix}/api/registration/change-password`, {
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
        await this.dash.create(ErrorDialog).show("Request was not processed by server.")
        return
      }

      let result = await response.json()
      if (result.done) {
        this.clearFields()
        await this.dash.create(InfoDialog).show("Password successfully updated.")
      } else {
        let msg = "Password was not changed. Maybe you mistyped your current password."
        await this.dash.create(InfoDialog).show(msg)
      }
    } catch (err) {
      this.log.error("Error while updating password.", err)
      await this.dash.create(ErrorDialog).show("Unable to update password.")
    }
  }

  private onCancel() {
    this.clearFields()
  }

  public showSpinner() {
    this.spinnerEl.style.display = "inline"
  }

  private hideSpinner() {
    this.spinnerEl.style.display = "none"
  }

  private clearFields() {
    this.state.prevPwd = ""
    this.state.newPwd = ""
    this.state.newPwd2 = ""
    this.view.update(this.state)
  }
}
