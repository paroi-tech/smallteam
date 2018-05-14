import config from "../../../../isomorphic/config"
import { PublicDash, Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import { Model, ContributorModel, SessionData } from "../../../AppModel/AppModel"
import Deferred from "../../../libraries/Deferred"
import ErrorDialog from "../../modal-dialogs/ErrorDialog/ErrorDialog"
import WarningDialog from "../../modal-dialogs/WarningDialog/WarningDialog"

const template = require("./RegistrationForm.monk")

export default class RegistrationForm {
  private readonly el: HTMLDialogElement
  private nameEl: HTMLInputElement
  private usernameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private confirmEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private curDfd: Deferred<string | number> | undefined

  constructor(private dash: Dash) {
    let view = render(template)
    this.el = view.rootEl()
    this.nameEl = view.ref("name")
    this.usernameEl = view.ref("username")
    this.passwordEl = view.ref("password")
    this.confirmEl = view.ref("confirm")
    this.spinnerEl = view.ref("spinner")

    view.ref(".js-submit-btn").addEventListener("click", ev => this.onSubmit())
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
    let name = this.nameEl.value.trim()
    if (name.length === 0) {
      this.nameEl.focus()
      return
    }

    let login = this.usernameEl.value.trim()
    if (login.length < 4 || login.match(/[^a-bA-B_0-9]/) != null) {
      this.usernameEl.focus()
      return
    }

    let password = this.passwordEl.value.trim()
  }

  private validateUserInput() {
    return false
  }
}
