import config from "../../../isomorphic/config"
import { PublicDash, Dash } from "bkb"
import { render } from "monkberry"
import { Model, ContributorModel, SessionData } from "../../AppModel/AppModel"
import Deferred from "../../libraries/Deferred"
import ErrorDialog from "../modal-dialogs/ErrorDialog/ErrorDialog"
import WarningDialog from "../modal-dialogs/WarningDialog/WarningDialog"

const template = require("./LoginDialog.monk")

export default class LoginDialog {
  private readonly el: HTMLDialogElement
  private nameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private submitBtnEl: HTMLButtonElement
  private spinnerEl: HTMLElement

  private view: MonkberryView

  private curDfd: Deferred<SessionData> | undefined

  constructor(private dash: Dash) {
    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLDialogElement
    this.nameEl = this.el.querySelector(".js-username") as HTMLInputElement
    this.passwordEl = this.el.querySelector(".js-password") as HTMLInputElement
    this.submitBtnEl =this. el.querySelector(".js-submitBtn") as HTMLButtonElement
    this.spinnerEl = this.el.querySelector(".js-spinner") as HTMLElement
    this.submitBtnEl.addEventListener("click", ev => this.onSubmit())

    this.el.addEventListener("keyup", ev => {
      if (ev.key === "Enter")
        this.submitBtnEl.click()
    })
    this.el.addEventListener("close", () => {
      if (this.curDfd) {
        this.curDfd.reject(new Error("Fail to connect"))
        this.curDfd = undefined
      }
    })

    document.body.appendChild(this.el)
    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  public open(): Promise<SessionData> {
    this.el.showModal()
    this.curDfd = new Deferred()

    return this.curDfd.promise
  }

  private removeWarning() {
    this.nameEl.style.borderColor = "gray"
    this.passwordEl.style.borderColor = "gray"
    this.el.style.pointerEvents = "none"
  }

  private async onSubmit() {
    this.removeWarning()

    let name = this.nameEl.value.trim()
    let password = this.passwordEl.value
    let start = false

    if (!this.checkUserInput(name, password))
      return

    this.spinnerEl.style.display = "block"

    let contributorId = await this.tryToLogin(name, password)

    if (contributorId) {
      this.el.close()
      if (this.curDfd) {
        this.curDfd.resolve({ contributorId })
        this.curDfd = undefined
      }
    } else
      this.nameEl.focus()

    this.spinnerEl.style.display = "none"
    this.el.style.pointerEvents = "auto"
  }

  private checkUserInput(name: string, password: string) {
    if (name.length < 4) {
      this.nameEl.style.borderColor = "red"
      this.nameEl.focus()
      this.el.style.pointerEvents = "auto"
      return false
    }

    if (password.length === 0) {
      this.passwordEl.style.borderColor = "red"
      this.passwordEl.focus()
      this.el.style.pointerEvents = "auto"
      return false
    }

    return true
  }

  private async tryToLogin(name: string, password: string): Promise<string | undefined> {
    let contributorId: string | undefined = undefined

    try {
      let response = await fetch(`${config.urlPrefix}/api/session/connect`, {
        method: "post",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          login: name,
          password
        })
      })

      if (!response.ok) {
        await this.dash.create(ErrorDialog).show("Unable to get a response from server.")
      } else {
        let result = await response.json()
        if (result.done)
          contributorId = result.contributorId as string
        else
          await this.dash.create(WarningDialog).show("Wrong username or password.")
      }
    } catch (err) {
      this.dash.app.log.warn(err)
    }

    return contributorId
  }
}
