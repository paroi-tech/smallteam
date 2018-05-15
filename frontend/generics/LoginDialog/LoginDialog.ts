import config from "../../../isomorphic/config"
import { PublicDash, Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import { Model, ContributorModel, SessionData } from "../../AppModel/AppModel"
import Deferred from "../../libraries/Deferred"
import ErrorDialog from "../modal-dialogs/ErrorDialog/ErrorDialog"
import WarningDialog from "../modal-dialogs/WarningDialog/WarningDialog"

const template = require("./LoginDialog.monk")

export default class LoginDialog {
  private readonly el: HTMLDialogElement
  private nameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private curDfd: Deferred<string> | undefined
  private enabled = true

  constructor(private dash: Dash) {
    let view = render(template)
    this.el = view.rootEl()
    this.nameEl = view.ref("username")
    this.passwordEl = view.ref("password") as HTMLInputElement
    this.spinnerEl = view.ref("spinner") as HTMLElement

    let btnEl: HTMLButtonElement = view.ref("submitBtn")
    btnEl.addEventListener("click", ev => this.onSubmit())
    this.el.addEventListener("keyup", ev => {
      if (ev.key === "Enter" && this.enabled)
        btnEl.click()
    })
    view.ref("pwdReset").addEventListener("click", ev => this.onPasswordReset())

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())

    document.body.appendChild(this.el)
  }

  public open(): Promise<string> {
    this.el.showModal()
    this.curDfd = new Deferred()
    return this.curDfd.promise
  }

  private removeWarnings() {
    this.nameEl.style.borderColor = "gray"
    this.passwordEl.style.borderColor = "gray"
  }

  private async onSubmit() {
    this.enabled = false
    this.removeWarnings()
    this.showSpinner()
    let login = this.nameEl.value.trim()
    let password = this.passwordEl.value.trim()
    if (this.checkUserInput(login, password)) {
      let contributorId = await this.tryToLogin(login, password)
      this.hideSpinner()
      if (contributorId && this.curDfd) {
        this.el.close()
        this.curDfd.resolve(contributorId)
        this.curDfd = undefined
      }
    }
    this.enabled = true
  }

  private onPasswordReset() {
    if (this.curDfd) {
      this.el.close()
      this.curDfd.resolve("resetPassword")
      this.curDfd = undefined
    }
  }

  private checkUserInput(login: string, password: string) {
    if (login.length < 4) {
      this.nameEl.style.borderColor = "red"
      this.nameEl.focus()
      return false
    }

    if (password.length < config.minPasswordLength) {
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
        await this.handleRequestError(response)
        return undefined
      }

      let result = await response.json()
      if (result.done) {
        let contributorId = result.contributorId as string
        return contributorId
      }
      await this.dash.create(WarningDialog).show("Wrong username or password.")
    } catch (err) {
      await this.dash.create(ErrorDialog).show("There was an problem while processing your resquest.")
      console.log(err)
    }

    return undefined
  }

  private async handleRequestError(response: Response) {
    if (response.status === 400) {
      let data = await response.json()
      await this.dash.create(WarningDialog).show(`Your request was not processed. ${data.error}`)
    } else if (response.status === 500)
      await this.dash.create(ErrorDialog).show("The server could not process your request.")
    else
      await this.dash.create(ErrorDialog).show("Unable to get a response from server.")
  }

  private showSpinner() {
    this.spinnerEl.style.display = "block"
  }

  private hideSpinner() {
    this.spinnerEl.style.display = "none"
  }
}
