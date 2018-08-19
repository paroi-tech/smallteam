import { whyNewPasswordIsInvalid, whyTeamCodeIsInvalid, whyUsernameIsInvalid } from "../../../isomorphic/libraries/helpers"
import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import Deferred from "../../libraries/Deferred"
import { ErrorDialog, InfoDialog, WarningDialog } from "../modalDialogs/modalDialogs"
import { validateEmail } from "../../libraries/utils"

const template = require("./TeamCreationDialog.monk")

export default class TeamCreationDialog {
  private readonly el: HTMLDialogElement
  private teamNameEl: HTMLInputElement
  private teamCodeEl: HTMLInputElement
  private nameEl: HTMLInputElement
  private loginEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private confirmEl: HTMLInputElement
  private emailEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private curDfd: Deferred<boolean> | undefined

  constructor(private dash: Dash<{ baseUrl: string }>) {
    let view = render(template)

    this.el = view.rootEl()
    this.teamNameEl = view.ref("teamName")
    this.teamCodeEl = view.ref("teamCode")
    this.nameEl = view.ref("name")
    this.loginEl = view.ref("login")
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
    let checkMsg: string | undefined
    let teamName = this.teamNameEl.value.trim()

    if (teamName.length === 0) {
      await dialog.show("Please enter a team name.")
      this.teamNameEl.focus()
      return
    }

    let teamCode = this.teamCodeEl.value.trim()

    checkMsg = whyTeamCodeIsInvalid(teamCode)
    if (checkMsg) {
      await dialog.show(checkMsg)
      this.teamNameEl.focus()
      return
    }

    let name = this.nameEl.value.trim()

    if (name.length === 0) {
      await dialog.show("Please enter a name for the user.")
      this.teamNameEl.focus()
      return
    }

    let login = this.loginEl.value.trim()

    checkMsg = whyUsernameIsInvalid(login)
    if (checkMsg) {
      await dialog.show(checkMsg)
      this.loginEl.focus()
      return
    }

    let password = this.passwordEl.value.trim()

    checkMsg = whyNewPasswordIsInvalid(password)
    if (checkMsg) {
      await dialog.show(checkMsg)
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

    let data = await this.checkTeamCode(teamCode)

    if (!data.done) {
      await dialog.show("Something went wrong. We could not contact server for the moment.")
      console.log(data)
      return
    }

    if (!data.answer) {
      await dialog.show("The code you chosed is not available. Try another one.")
      this.teamCodeEl.focus()
      return
    }

    if (await this.register(teamName, teamCode, name, login, password, email) && this.curDfd) {
      this.curDfd.resolve(true)
      this.curDfd = undefined
      this.el.close()
    }
  }

  private async checkTeamCode(teamCode: string) {
    let returnValue = { done: false, answer: false }

    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/team/check-id`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ teamCode })
      })

      if (response.ok) {
        returnValue.answer = (await response.json()).answer
        returnValue.done = true
      }
    } catch (error) {
      this.dash.log.error("Unable to get response from server", error)
    }

    return returnValue
  }

  private async register(teamName: string, teamCode: string, name: string, username: string, password: string, email: string) {
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/team/create`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ teamName, teamCode, name, username, password, email })
      })

      if (!response.ok) {
        await this.dash.create(ErrorDialog).show("Cannot complete this task now. Try again in a moment.")
        return false
      }

      let answer = await response.json()

      if (answer.done) {
        this.dash.create(InfoDialog).show("You have been successfully registred.")
        return true
      } else {
        this.dash.create(ErrorDialog).show("Something went wrong. We are sorry for the inconvenience. Try again later.")
        return false
      }
    } catch (error) {
      this.dash.log.error(error)
      this.dash.create(InfoDialog).show("Something went wrong. We cannot reach our server.")
    }

    return false
  }
}
