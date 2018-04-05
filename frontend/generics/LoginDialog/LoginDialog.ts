import config from "../../../isomorphic/config"
import { PublicDash, Dash } from "bkb"
import { render } from "monkberry"
import { Model, ContributorModel, SessionData } from "../../AppModel/AppModel"
import Deferred from "../../libraries/Deferred"
import ErrorDialog from "../modal-dialogs/ErrorDialog/ErrorDialog"
import WarningDialog from "../modal-dialogs/WarningDialog/WarningDialog"

const template = require("./LoginDialog.monk")

export default class LoginDialog {
  private readonly el: HTMLDialogElement
  private nameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private submitBtnEl: HTMLButtonElement
  private spinnerEl: HTMLElement
  private resetPasswordEl: HTMLElement

  private view: MonkberryView

  private curDfd: Deferred<SessionData> | undefined

  constructor(private dash: Dash) {
    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLDialogElement
    this.nameEl = this.el.querySelector(".js-username") as HTMLInputElement
    this.passwordEl = this.el.querySelector(".js-password") as HTMLInputElement
    this.submitBtnEl =this. el.querySelector(".js-submitBtn") as HTMLButtonElement
    this.spinnerEl = this.el.querySelector(".js-spinner") as HTMLElement
    this.resetPasswordEl = this.el.querySelector(".js-pwd-reset") as HTMLElement
    this.submitBtnEl.addEventListener("click", ev => this.onSubmit())
    this.resetPasswordEl.addEventListener("click", ev => this.onPasswordReset())

    this.el.addEventListener("keyup", ev => {
      if (ev.key === "Enter")
        this.submitBtnEl.click()
    })
    this.el.addEventListener("close", () => {
      if (this.curDfd) {
        this.curDfd.reject(new Error("Fail to connect"))
        this.curDfd = undefined
      }
    })

    document.body.appendChild(this.el)
    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  public open(): Promise<SessionData> {
    this.enable()
    this.el.showModal()
    this.curDfd = new Deferred()
    return this.curDfd.promise
  }

  private removeWarnings() {
    this.nameEl.style.borderColor = "gray"
    this.passwordEl.style.borderColor = "gray"
    this.el.style.pointerEvents = "none"
  }

  private async onSubmit() {
    this.disable()
    this.removeWarnings()
    this.showSpinner()

    let login = this.nameEl.value.trim()
    let password = this.passwordEl.value
    if (!this.checkUserInput(login, password)) {
      this.enable()
      return
    }

    let contributorId = await this.tryToLogin(login, password)
    this.hideSpinner()
    if (contributorId && this.curDfd) {
      this.el.close()
      this.curDfd.resolve({ contributorId })
      this.curDfd = undefined
      return
    }

    this.enable()
    this.nameEl.focus()
  }

  private onPasswordReset() {
    if (this.curDfd) {
      this.el.close()
      this.curDfd.resolve({ contributorId: "-1" })
      this.curDfd = undefined
    }
  }

  private checkUserInput(login: string, password: string) {
    if (login.length < 4) {
      this.nameEl.style.borderColor = "red"
      this.nameEl.focus()
      return false
    }

    if (password.length === 0) {
      this.passwordEl.style.borderColor = "red"
      this.passwordEl.focus()
      return false
    }

    return true
  }

  private async tryToLogin(login: string, password: string): Promise<string | undefined> {
    try {
      let response = await fetch(`${config.urlPrefix}/api/session/connect`, {
        method: "post",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, password })
      })

      if (!response.ok) {
        await this.dash.create(ErrorDialog).show("Unable to get a response from server.")
        return undefined
      }

      let result = await response.json()
      if (result.done) {
        let contributorId = result.contributorId as string
        return contributorId
      }
      await this.dash.create(WarningDialog).show("Wrong username or password.")
    } catch (err) {
      this.dash.app.log.warn(err)
    }

    return undefined
  }

  private enable() {
    this.el.style.pointerEvents = "auto"
  }

  private disable() {
    this.el.style.pointerEvents = "none"
  }

  private showSpinner() {
    this.spinnerEl.style.display = "block"
  }

  private hideSpinner() {
    this.spinnerEl.style.display = "none"
  }
}
