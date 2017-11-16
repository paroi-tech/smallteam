import { Dash, Log } from "bkb"
import { render } from "monkberry"
import App from "../../../App/App"
import { Model, ContributorModel } from "../../../AppModel/AppModel"
import config from "../../../../isomorphic/config"

const template = require("./AvatarForm.monk")

export default class AvatarForm {
  readonly el: HTMLElement
  private inputEl: HTMLInputElement
  private buttonEl: HTMLButtonElement
  private spinnerEl: HTMLElement
  private formEl: HTMLFormElement

  private model: Model
  private log: Log

  private view: MonkberryView

  constructor(private dash: Dash<App>, readonly contributor: ContributorModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log
    this.el = this.createView()
  }

  private createView() {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement
    this.buttonEl = el.querySelector("button") as HTMLButtonElement
    this.inputEl = el.querySelector(".js-input") as HTMLInputElement
    this.formEl = el.querySelector("form") as HTMLFormElement
    this.buttonEl.addEventListener("click", ev => this.onSubmit())
    this.spinnerEl = this.buttonEl.querySelector(".js-spinner") as HTMLElement

    return el
  }

  private async onSubmit() {
    if (!this.inputEl.files || this.inputEl.files.length === 0) {
      console.log("No image provided...")
      return
    }

    this.spinnerEl.style.display = "inline"
    let fd = new FormData(this.formEl)
    fd.append("avatar", this.inputEl.files.item(0), "avatar.png")
    await this.doUpload(fd)
    this.spinnerEl.style.display = "none"
  }

  private async doUpload(fd: FormData) {
    try {
      let response = await fetch(`${config.urlPrefix}/api/session/change-avatar`, {
        method: "post",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "Content-Type": "image/png, image/jpeg, image/gif"
        },
        body: fd
      })

      if (!response.ok) {
        alert("Error. Request was not processed by server.")
        return
      }

      let result = await response.json()
      if (result.done)
        console.log("Avatar successfully updloaded.")
      else
        console.log("Error while uploading image.")
    } catch (err) {
      this.dash.app.log.warn(err)
    }
  }

}
