import { Dash, Log } from "bkb"
import { render } from "monkberry"
import App from "../../../App/App"
import { Model, ContributorModel } from "../../../AppModel/AppModel"
import config from "../../../../isomorphic/config"
import ErrorDialog from "../../../generics/modal-dialogs/ErrorDialog/ErrorDialog"

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

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.formEl = this.el.querySelector("form") as HTMLFormElement
    this.buttonEl = this.formEl.querySelector("button") as HTMLButtonElement
    this.inputEl = this.formEl.querySelector(".js-input") as HTMLInputElement
    this.spinnerEl = this.buttonEl.querySelector(".js-spinner") as HTMLElement
    this.formEl.onsubmit = (ev) => {
      ev.preventDefault()
      this.onSubmit()
    }
  }

  private async onSubmit() {
    if (!this.inputEl.files || this.inputEl.files.length === 0) {
      this.log.warn("No image provided...")
      return
    }

    this.showSpinner()
    let fd = new FormData(this.formEl)
    await this.doUpload(fd)
    this.hideSpinner()
  }

  private async doUpload(fd: FormData) {
    try {
      let response = await fetch(`${config.urlPrefix}/api/session/change-avatar`, {
        method: "post",
        credentials: "same-origin",
        body: fd
      })

      if (!response.ok) {
        await this.dash.create(ErrorDialog).show("Request was not processed by server.")
        return
      }

      let result = await response.json()
      if (result.done)
        this.log.info("Avatar successfully updloaded.")
      else
        this.log.error("Error while uploading image.")
    } catch (err) {
      this.dash.app.log.warn(err)
    }
  }

  private showSpinner() {
    this.spinnerEl.style.display = "inline"
  }

  private hideSpinner() {
    this.spinnerEl.style.display = "none"
  }
}
