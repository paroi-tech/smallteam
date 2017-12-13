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
    this.formEl = el.querySelector("form") as HTMLFormElement
    this.buttonEl = this.formEl.querySelector("button") as HTMLButtonElement
    this.inputEl = this.formEl.querySelector(".js-input") as HTMLInputElement
    this.spinnerEl = this.buttonEl.querySelector(".js-spinner") as HTMLElement

    this.formEl.onsubmit = (ev) => {
      ev.preventDefault()
      this.onSubmit()
    }

    return el
  }

  private async onSubmit() {
    if (!this.inputEl.files || this.inputEl.files.length === 0) {
      console.log("No image provided...")
      return
    }

    this.spinnerEl.style.display = "inline"
    let fd = new FormData(this.formEl)
    await this.doUpload(fd)
    this.spinnerEl.style.display = "none"
  }

  private async doUpload(fd: FormData) {
    try {
      let response = await fetch(`${config.urlPrefix}/api/session/change-avatar`, {
        method: "post",
        credentials: "same-origin",
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
