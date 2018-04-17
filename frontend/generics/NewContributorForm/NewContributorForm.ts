import config from "../../../isomorphic/config"
import { PublicDash, Dash } from "bkb"
import { render } from "monkberry"
import { Model, ContributorModel, SessionData } from "../../AppModel/AppModel"
import Deferred from "../../libraries/Deferred"
import ErrorDialog from "../modal-dialogs/ErrorDialog/ErrorDialog"
import WarningDialog from "../modal-dialogs/WarningDialog/WarningDialog"

const template = require("./LoginDialog.monk")

export default class NewContributorForm {
  private readonly el: HTMLDialogElement
  private firstnameEl: HTMLInputElement
  private lastnameEl: HTMLInputElement
  private usernameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private confirmEl: HTMLInputElement
  private submitBtnEl: HTMLButtonElement
  private spinnerEl: HTMLElement

  private view: MonkberryView

  private curDfd: Deferred<string | number> | undefined

  constructor(private dash: Dash) {
    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLDialogElement
    this.firstnameEl = this.el.querySelector(".js-firstname") as HTMLInputElement
    this.lastnameEl = this.el.querySelector(".js-lastname") as HTMLInputElement
    this.usernameEl = this.el.querySelector(".js-username") as HTMLInputElement
    this.passwordEl = this.el.querySelector(".js-password") as HTMLInputElement
    this.confirmEl = this.el.querySelector(".js-confirm") as HTMLInputElement
    this.submitBtnEl =this. el.querySelector(".js-submit-btn") as HTMLButtonElement
    this.spinnerEl = this.el.querySelector(".js-spinner") as HTMLElement

    this.submitBtnEl.addEventListener("click", ev => this.onSubmit())

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
    document.body.appendChild(this.el)
  }

  public async open() {
    this.el.showModal()
    this.curDfd = new Deferred()
    return this.curDfd.promise
  }

  private onSubmit() {

  }

  private validateUserInput() {
    return false
  }
}
