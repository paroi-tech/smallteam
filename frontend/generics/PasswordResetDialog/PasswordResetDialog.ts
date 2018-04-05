import config from "../../../isomorphic/config"
import { PublicDash, Dash } from "bkb"
import { render } from "monkberry"
import { Model, ContributorModel, SessionData } from "../../AppModel/AppModel"
import Deferred from "../../libraries/Deferred"
import ErrorDialog from "../modal-dialogs/ErrorDialog/ErrorDialog"
import WarningDialog from "../modal-dialogs/WarningDialog/WarningDialog"

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

    document.body.appendChild(this.el)
    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  public open(): Promise<string | number> {
    this.el.showModal()
    this.curDfd = new Deferred()
    return this.curDfd.promise
  }

  private async onSubmit() {
    this.disable()
    this.showSpinner()
    await this.makeApiCall()
    this.hideSpinner()
    this.hideSpinner()
  }

  private async makeApiCall() {
    try {

    } catch (error) {

    }
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
