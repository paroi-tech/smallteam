import config from "../../isomorphic/config"
import { PublicDash, Dash } from "bkb"
import { render } from "monkberry"

const template = require("./PasswordResetDialog.monk")

export default class LoginDialog {
  readonly el: HTMLDialogElement

  private passwordEl: HTMLInputElement
  private passwordConfirmEl: HTMLInputElement
  private submitBtnEl: HTMLButtonElement
  private spinnerEl: HTMLElement

  private view: MonkberryView

  constructor(private dash: Dash, private contributorId: string, private token: string) {
    this.el = this.createView()
    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  public open() {
    this.el.showModal()
  }

  private createView() {
    this.view = render(template, document.createElement("div"))
    let el = this.view.nodes[0] as HTMLDialogElement

    this.passwordEl = el.querySelector(".js-password") as HTMLInputElement
    this.passwordConfirmEl = el.querySelector(".js-confirm") as HTMLInputElement
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
    let password = this.passwordEl.value
    let start = false

    if (password.length < 8 || password.length > 32) {
      alert("Password should have at least 8 characters and at most 32 characters.")
      this.passwordEl.focus()
      return
    }

    if (this.passwordConfirmEl.value !== password) {
      alert("Passwords do not match.")
      this.passwordConfirmEl.focus()
      return
    }

    // TODO: Request actions on server here...

    this.spinnerEl.style.display = "inline"
  }

  private async doPasswordChange() {

  }

}
