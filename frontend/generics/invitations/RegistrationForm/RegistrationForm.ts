import config from "../../../../isomorphic/config"
import { PublicDash, Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import { Model, ContributorModel, SessionData } from "../../../AppModel/AppModel"
import Deferred from "../../../libraries/Deferred"
import ErrorDialog from "../../modalDialogs/ErrorDialog/ErrorDialog"
import WarningDialog from "../../modalDialogs/WarningDialog/WarningDialog"
import { validateEmail } from "../../../libraries/utils"
import InfoDialog from "../../modalDialogs/InfoDialog/InfoDialog"

const template = require("./RegistrationForm.monk")

export default class RegistrationForm {
  private readonly el: HTMLDialogElement
  private nameEl: HTMLInputElement
  private usernameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private confirmEl: HTMLInputElement
  private emailEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private curDfd: Deferred<boolean> | undefined

  constructor(private dash: Dash, private token: string, username?: string) {
    let view = render(template)
    this.el = view.rootEl()
    this.nameEl = view.ref("name")
    this.usernameEl = view.ref("username")
    this.passwordEl = view.ref("password")
    this.confirmEl = view.ref("confirm")
    this.emailEl = view.ref("email")
    this.spinnerEl = view.ref("spinner")

    view.ref("submitBtn").addEventListener("click", ev => this.onSubmit())
    view.ref("cancelBtn").addEventListener("click", ev => {
      if (this.curDfd) {
        this.curDfd.reject("Process canceled")
        this.curDfd = undefined
        this.el.close()
      }
    })

    this.usernameEl.value = username || ""

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
    document.body.appendChild(this.el)
  }

  public async open() {
    this.el.showModal()
    this.curDfd = new Deferred()
    return this.curDfd.promise
  }

  private async onSubmit() {
    let dialog = this.dash.create(WarningDialog)

    let name = this.nameEl.value.trim()
    if (name.length === 0) {
      await dialog.show("Please enter your name.")
      this.nameEl.focus()
      return
    }

    let login = this.usernameEl.value.trim()
    if (login.length < 4 || /[^a-zA-Z_0-9]/.test(login)) {
      await dialog.show("Please enter a username. It should have at least 4 characters and contain only letters and digits.")
      this.usernameEl.focus()
      return
    }

    let password = this.passwordEl.value.trim()
    if (password.length < config.minPasswordLength) {
      await dialog.show(`Password should contain at least ${config.minPasswordLength} characters.`)
      this.passwordEl.focus()
      return
    }

    if (this.confirmEl.value.trim() !== password) {
      await dialog.show("Passwords do not match.")
      this.confirmEl.focus()
      return
    }

    let email = this.emailEl.value.trim()
    if (email.length === 0 || !validateEmail(email)) {
      await dialog.show("Please enter a valid email address.")
      this.emailEl.focus()
      return
    }

    let b = await this.register(name, login, password, email)
    if (b && this.curDfd) {
      this.curDfd.resolve(true)
      this.curDfd = undefined
      this.el.close()
    }
  }

  private async register(name: string, login: string, password: string, email:string) {
    try {
      let response = await fetch(`${config.urlPrefix}/api/registration/register`, {
        method: "post",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, login, password, email, token: this.token })
      })
      if (!response.ok)
        throw new Error("Our server did not process the request.")

      let answer = await response.json()
      if (answer.done) {
        this.dash.create(InfoDialog).show("You have been successfully registred.")
        return true
      } else {
        this.dash.create(InfoDialog).show("Registration failed. Try again later or contact the admin.")
        return false
      }
    } catch (error) {
      this.dash.create(ErrorDialog).show("Something went wrong. We are sorry for the inconvenience. Try again later.")
      this.dash.log.error(error)
    }

    return false
  }
}