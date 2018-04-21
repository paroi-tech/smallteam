import { Dash, Log } from "bkb"
import App from "../../../App/App"
import { Model, ContributorModel } from "../../../AppModel/AppModel"
import config from "../../../../isomorphic/config"
import ErrorDialog from "../../../generics/modal-dialogs/ErrorDialog/ErrorDialog"
import { OwnDash } from "../../../App/OwnDash";
import { render } from "@fabtom/lt-monkberry";

const template = require("./AvatarForm.monk")

export default class AvatarForm {
  readonly el: HTMLElement
  private inputEl: HTMLInputElement
  private buttonEl: HTMLButtonElement
  private spinnerEl: HTMLElement
  private formEl: HTMLFormElement

  private model: Model
  private log: Log

  constructor(private dash: OwnDash, readonly contributor: ContributorModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    let view = render(template)
    this.el = view.rootEl()
    this.formEl = view.ref("form")
    this.buttonEl = view.ref("btn")
    this.inputEl = view.ref("input")
    this.spinnerEl = view.ref("spinner")
    this.formEl.addEventListener("submit", ev => {
      ev.preventDefault()
      this.onSubmit()
    })
  }

  private async onSubmit() {
    if (!this.inputEl.files || this.inputEl.files.length === 0) {
      this.log.warn("No image provided...")
      return
    }

    this.showSpinner()
    await this.doUpload()
    this.hideSpinner()
  }

  private async doUpload() {
    let meta = {
      ref: {
        type: "contributorAvatar",
        id: this.contributor.id
      },
      overwrite: true
    }

    let fd = new FormData(this.formEl)
    fd.append("meta", JSON.stringify(meta))
    try {
      let response = await fetch(`${config.urlPrefix}/medias/upload`, {
        method: "post",
        credentials: "same-origin",
        body: fd
      })

      if (!response.ok) {
        await this.dash.create(ErrorDialog).show("Request was not processed by server.")
        return
      }

      let result = await response.json()
      if (result.modelUpd)
        this.model.processModelUpdate(result.modelUpd)
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
