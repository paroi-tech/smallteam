import App from "../App/App"
import { Model } from "../AppModel/AppModel"
import { render } from "monkberry"

import * as template from "./logindialog.monk"

export default class LoginDialog {
  readonly el: HTMLDialogElement

  private nameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private submitBtnEl: HTMLButtonElement
  private cancelBtnEl: HTMLButtonElement
  private spinnerEl: HTMLElement

  private view: MonkberryView

  constructor() {
    this.el = this.createView()
  }

  private createView() {
    this.view = render(template, document.createElement("div"))
    let el = this.view.nodes[0] as HTMLDialogElement

    this.nameEl = el.querySelector(".js-username") as HTMLInputElement
    this.passwordEl = el.querySelector(".js-password") as HTMLInputElement
    this.submitBtnEl = el.querySelector(".js-submit-btn") as HTMLButtonElement
    this.cancelBtnEl = el.querySelector(".js-cancel-btn") as HTMLButtonElement
    this.spinnerEl = el.querySelector(".js-spinner") as HTMLElement
    this.submitBtnEl.addEventListener("click", ev => this.onSubmit())
    this.cancelBtnEl.addEventListener("click", ev => this.onCancel())

    document.body.appendChild(el)

    return el
  }

  private onSubmit() {
    let name = this.nameEl.value.trim()
    let passwd = this.passwordEl.value

    if (name.length < 0) {
      this.nameEl.style.borderColor = "red"
      this.nameEl.focus()
      return
    }

    // Restore default border color of the username field.
    this.nameEl.style.borderColor = "gray"

    this.spinnerEl.style.display = "inline"
    let data = {
      username: name,
      password: passwd
    }
    fetch("/login", {
      method: "post",
      credentials: "include",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
        return response.text()
      }
      throw new Error("Login request not completed...")
    }).then(json => {
      let response = JSON.parse(json)
      this.spinnerEl.style.display = "none"
      if (!response.user) {
        alert("Wrong unsername or password")
      } else {
        console.log("Login successful. Redirecting...")
        setTimeout(() => {
          location.reload(true)
        }, 1000)
      }
    }).catch(error => {
      console.log(error)
      alert("Unable to log on server...")
    })
  }

  private onCancel() {

  }

  private show() {
    this.el.showModal()
  }

  private hide() {
    this.el.close()
  }
}
