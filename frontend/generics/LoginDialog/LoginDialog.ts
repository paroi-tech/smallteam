import config from "../../../isomorphic/config"
import { Bkb, Dash } from "bkb"
import { render } from "monkberry"
import App from "../../App/App"
import { Model, ContributorModel, SessionData } from "../../AppModel/AppModel"
import Deferred from "../../libraries/Deferred"

const template = require("./LoginDialog.monk")

export default class LoginDialog {
  readonly el: HTMLDialogElement

  private nameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private submitBtnEl: HTMLButtonElement
  private spinnerEl: HTMLElement

  private view: MonkberryView

  private curDfd: Deferred<SessionData> | undefined

  constructor(private dash: Dash<App>) {
    this.el = this.createView()
    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  public open(): Promise<SessionData> {
    this.el.showModal()
    this.curDfd = new Deferred()
    return this.curDfd.promise
  }

  private createView() {
    this.view = render(template, document.createElement("div"))
    let el = this.view.nodes[0] as HTMLDialogElement

    this.nameEl = el.querySelector(".js-username") as HTMLInputElement
    this.passwordEl = el.querySelector(".js-password") as HTMLInputElement
    this.submitBtnEl = el.querySelector(".js-submit-btn") as HTMLButtonElement
    this.spinnerEl = el.querySelector(".js-spinner") as HTMLElement
    this.submitBtnEl.addEventListener("click", ev => this.onSubmit())

    el.addEventListener("keyup", ev => {
      if (ev.key === "Enter")
        this.submitBtnEl.click()
    })
    el.addEventListener("close", () => {
      if (this.curDfd) {
        this.curDfd.reject(new Error("Fail to connect"))
        this.curDfd = undefined;
      }
    })
    document.body.appendChild(el)

    return el
  }

  private async onSubmit() {
    // Restore default border color of the fields.
    this.nameEl.style.borderColor = "gray"
    this.passwordEl.style.borderColor = "gray"
    this.el.style.pointerEvents = "none"

    let name = this.nameEl.value.trim()
    let password = this.passwordEl.value
    let start = false

    if (name.length < 4) {
      this.nameEl.style.borderColor = "red"
      this.nameEl.focus()
      this.el.style.pointerEvents = "auto"
      return
    }

    if (password.length === 0) {
      this.passwordEl.style.borderColor = "red"
      this.passwordEl.focus()
      this.el.style.pointerEvents = "auto"
      return
    }

    this.spinnerEl.style.display = "inline"

    let contributorId = await this.tryToLogin(name, password)

    if (contributorId) {
      this.el.close()
      if (this.curDfd) {
        this.curDfd.resolve({ contributorId })
        this.curDfd = undefined
      }
    }  else {
      this.nameEl.focus()
    }
    this.spinnerEl.style.display = "none"
    this.el.style.pointerEvents = "auto"
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
        alert("Error. Unable to get a response from server...")
      } else {
        let result = await response.json()

        if (result.done)
          contributorId = result.contributorId as string
        else
          alert("Wrong username or password.")
      }
    } catch (err) {
      this.dash.app.log.warn(err)
    }

    return contributorId
  }
}
