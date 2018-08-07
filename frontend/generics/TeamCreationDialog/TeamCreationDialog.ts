import config from "../../../isomorphic/config"
import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import Deferred from "../../libraries/Deferred"
import { ErrorDialog, InfoDialog, WarningDialog } from "../modalDialogs/modalDialogs"
import { validateEmail } from "../../libraries/utils"

const template = require("./TeamCreationDialog.monk")

export default class TeamCreationDialog {
  private readonly el: HTMLDialogElement
  private teamNameEl: HTMLInputElement
  private teamIdEl: HTMLInputElement
  private usernameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private confirmEl: HTMLInputElement
  private emailEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private curDfd: Deferred<boolean> | undefined

  constructor(private dash: Dash) {
    let view = render(template)
    this.el = view.rootEl()
    this.teamNameEl = view.ref("teamName")
    this.teamIdEl = view.ref("teamId")
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

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  public async open() {
    document.body.appendChild(this.el)
    this.el.showModal()
    this.curDfd = new Deferred()
    return this.curDfd.promise
  }

  private async onSubmit() {
    let dialog = this.dash.create(WarningDialog)

    let teamName = this.teamNameEl.value.trim()
    if (teamName.length === 0) {
      await dialog.show("Please enter a team name.")
      this.teamNameEl.focus()
      return
    }

    let teamId = this.teamIdEl.value.trim()
    let rgx = /[a-z0-9][a-z0-9-]*[a-z0-9]$/g
    if (teamId.length === 0 || !rgx.test(teamId) || teamId === "www") {
      await dialog.show("Please enter a valid team name.")
      this.teamNameEl.focus()
      return
    }

    let username = this.usernameEl.value.trim()
    if (username.length < 4 || /[^a-zA-Z_0-9]/.test(username)) {
      let s = "Please enter a username. It should have at least 4 characters and contain only letters and digits."
      await dialog.show(s)
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

    if (await this.register(teamName, username, password, email) && this.curDfd) {
      this.curDfd.resolve(true)
      this.curDfd = undefined
      this.el.close()
    }
  }

  private async register(teamName: string, username: string, password: string, email:string) {
    try {
      let response = await fetch(`${config.urlPrefix}/api/registration/register`, {
        method: "post",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ teamName, username, password, email })
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
