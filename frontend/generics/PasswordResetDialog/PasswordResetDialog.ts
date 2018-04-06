import config from "../../../isomorphic/config"
import { PublicDash, Dash } from "bkb"
import { render } from "monkberry"
import { Model, ContributorModel, SessionData } from "../../AppModel/AppModel"
import Deferred from "../../libraries/Deferred"
import ErrorDialog from "../modal-dialogs/ErrorDialog/ErrorDialog"
import InfoDialog from "../modal-dialogs/InfoDialog/InfoDialog"

const template = require("./PasswordResetDialog.monk")

export default class LoginDialog {
  private readonly el: HTMLDialogElement
  private emailEl: HTMLInputElement
  private submitBtnEl: HTMLButtonElement
  private cancelBtnEl: HTMLButtonElement
  private spinnerEl: HTMLElement

  private view: MonkberryView

  private curDfd: Deferred<any> | undefined

  constructor(private dash: Dash) {
    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLDialogElement
    this.emailEl = this.el.querySelector(".js-email") as HTMLInputElement
    this.submitBtnEl =this. el.querySelector(".js-submit") as HTMLButtonElement
    this.cancelBtnEl =this. el.querySelector(".js-cancel") as HTMLButtonElement
    this.spinnerEl = this.el.querySelector(".js-spinner") as HTMLElement

    this.el.addEventListener("keyup", ev => {
      if (ev.key === "Enter")
        this.submitBtnEl.click()
    })
    this.submitBtnEl.addEventListener("click", ev => this.onSubmit())

    document.body.appendChild(this.el)
    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
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
      let response = await fetch(`${config.urlPrefix}/api/session/send-password-reset-mail`, {
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
