import { Dash, Log } from "bkb"
import App from "../../../App/App"
import { render } from "monkberry"
import { Model, TaskModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { removeAllChildren } from "../../../libraries/utils"
import { FileInfoModel } from "../../../AppModel/Models/FileInfoModel"
import config from "../../../../isomorphic/config"

const template = require("./TaskAttachmentManager.monk")
const itemTemplate = require("./item.monk")

export default class TaskAttachmentManager {
  readonly el: HTMLElement
  private listEl: HTMLElement
  private formEl: HTMLFormElement
  private inputEl: HTMLInputElement
  private uploadButtonEl: HTMLButtonElement
  private spinnerEl: HTMLElement

  private model: Model
  private currentTask: TaskModel | undefined
  private log: Log

  private view: MonkberryView

  constructor(private dash: Dash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log
    this.el = this.createView()
  }

  public reset() {
    this.currentTask = undefined
    removeAllChildren(this.listEl)
  }

  get task(): TaskModel | undefined {
    return this.currentTask
  }

  set task(task: TaskModel | undefined) {
    this.reset()
    this.currentTask = task
    if (!task || !task.attachedFiles)
      return
    for (let f of task.attachedFiles)
      this.addFile(f)
  }

  private createView() {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement
    this.listEl = el.querySelector("ul") as HTMLElement
    this.formEl = el.querySelector("form") as HTMLFormElement
    this.inputEl = el.querySelector(".js-input") as HTMLInputElement
    this.uploadButtonEl = el.querySelector(".js-upload-button") as HTMLButtonElement
    this.spinnerEl = el.querySelector(".js-spinner") as HTMLElement

    this.formEl.onsubmit = (ev) => {
      ev.preventDefault()
      this.onFormSubmit()
    }

    return el
  }

  private async onFormSubmit() {
    if (!this.inputEl.files || this.inputEl.files.length === 0)
      return
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

  private addFile(f: FileInfoModel) {
    let view = render(itemTemplate, document.createElement("div"))
    let el = view.nodes[0] as HTMLElement

    let downloadBtn = el.querySelector(".js-download-button") as HTMLButtonElement
    downloadBtn.addEventListener("click", (ev) => {
      // TODO: Add code for attached file download.
    })

    let deleteBtn = el.querySelector(".js-delete-button") as HTMLButtonElement
    deleteBtn.addEventListener("click", (ev) => {

    })

    view.update({ name: f.name })
    this.listEl.appendChild(el)
  }

  private showSpinner() {
    this.spinnerEl.style.display = "inline"
  }

  private hideSpinner() {
    this.spinnerEl.style.display = "none"
  }
}
