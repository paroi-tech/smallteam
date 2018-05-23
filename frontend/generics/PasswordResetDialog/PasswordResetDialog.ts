import config from "../../../isomorphic/config"
import { PublicDash, Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import { Model, ContributorModel, SessionData } from "../../AppModel/AppModel"
import Deferred from "../../libraries/Deferred"
import ErrorDialog from "../modalDialogs/ErrorDialog/ErrorDialog"
import InfoDialog from "../modalDialogs/InfoDialog/InfoDialog"

const template = require("./PasswordResetDialog.monk")

export default class LoginDialog {
  private readonly el: HTMLDialogElement
  private emailEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private curDfd: Deferred<any> | undefined

  constructor(private dash: Dash) {
    let view = render(template)
    this.el = view.rootEl()
    this.emailEl = view.ref("email")
    this.spinnerEl = view.ref("spinner")

    let btnEl: HTMLButtonElement = view.ref("submit")
    btnEl.addEventListener("click", ev => this.onSubmit())
    view.ref("cancel").addEventListener("click", ev => this.onCancel())
    this.el.addEventListener("keyup", ev => {
      if (ev.key === "Enter")
        btnEl.click()
    })

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())

    document.body.appendChild(this.el)
  }

  public open() {
    this.el.showModal()
    this.curDfd = new Deferred()
    return this.curDfd.promise
  }

  private async onSubmit() {
    this.disable()
    this.showSpinner()

    let address = this.emailEl.value
    if (address) {
      if (await this.makeApiCall(address) && this.curDfd) {
        this.curDfd.resolve(undefined)
        this.curDfd = undefined
        this.el.close()
      }
    }

    this.enable()
    this.hideSpinner()
  }

  private async makeApiCall(address: string) {
    try {
      let response = await fetch(`${config.urlPrefix}/api/registration/send-password-reset-mail`, {
        method: "post",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: address })
      })

      if (!response.ok) {
        await this.dash.create(ErrorDialog).show("Unable to get a response from server.")
        return false
      }

      let result = await response.json()
      if (result.done) {
        let msg = "Request received by server. Your should receive an email in order to complete the process."
        await this.dash.create(InfoDialog).show(msg)
        return true
      }
      await this.dash.create(ErrorDialog).show(`There was an problem while processing your resquest.\n${result.reason}`)
    } catch (err) {
      await this.dash.create(ErrorDialog).show("There was an problem while processing your resquest.")
      console.log(err)
    }

    return false
  }

  private onCancel() {
    if (this.curDfd) {
      this.el.close()
      this.curDfd.resolve(undefined)
      this.curDfd = undefined
    }
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
