import config from "../../isomorphic/config"
import App from "../App/App"
import { Bkb, Dash } from "bkb"
import { Model, ContributorModel } from "../AppModel/AppModel"
import { render } from "monkberry"
import * as template from "./logindialog.monk"

export default class LoginDialog {
  readonly el: HTMLDialogElement

  private nameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private submitBtnEl: HTMLButtonElement
  private spinnerEl: HTMLElement

  private returnValue = ""

  private view: MonkberryView

  constructor(private dash: Dash<App>) {
    this.el = this.createView()
    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
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

    if (password.length == 0) {
      this.passwordEl.style.borderColor = "red"
      this.passwordEl.focus()
      this.el.style.pointerEvents = "auto"
      return
    }

    this.spinnerEl.style.display = "inline"

    let contributorId = await this.doLogin(name, password)

    if (contributorId) {
      // IMPORTANT: the dialog return value is set here...
      this.returnValue = contributorId
      this.close()
    }  else {
      this.nameEl.focus()
    }
    this.spinnerEl.style.display = "none"
    this.el.style.pointerEvents = "auto"
  }

  private async doLogin(name: string, password: string): Promise<string | undefined> {
    let contributorId: string | undefined = undefined

    try {
      let response = await fetch(`${config.urlPrefix}/api/connect`, {
        method: "post",
        credentials: "include",
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
        let json = await response.text()
        let answer = JSON.parse(json)

        if (answer.done)
          contributorId = answer.contributorId as string
        else
        alert("Wrong username or password.")
      }
    } catch (err) {
      console.warn(err)
    }

    return contributorId
  }

  private show() {
    this.el.showModal()
  }

  private close() {
    this.el.close(this.returnValue)
  }
}
