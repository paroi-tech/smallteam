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
  private firstnameEl: HTMLInputElement
  private lastnameEl: HTMLInputElement
  private usernameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private confirmEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private curDfd: Deferred<string | number> | undefined

  constructor(private dash: Dash) {
    let view = render(template)
    this.el = view.rootEl()
    this.firstnameEl = view.ref("firstname")
    this.lastnameEl = view.ref("lastname")
    this.usernameEl = view.ref("username")
    this.passwordEl = view.ref("password")
    this.confirmEl = view.ref("confirm")
    this.spinnerEl = view.ref("spinner")

    view.ref(".js-submit-btn").addEventListener("click", ev => this.onSubmit())

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  public async open() {
    document.body.appendChild(this.el)
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
