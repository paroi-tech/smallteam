import { Dash, Log } from "bkb"
import App from "../../../App/App"
import { render } from "monkberry"
import { Model, TaskModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { removeAllChildren } from "../../../libraries/utils"
import { FileInfoModel } from "../../../AppModel/Models/FileInfoModel"
import config from "../../../../isomorphic/config"
import ErrorDialog from "../../../generics/modal-dialogs/ErrorDialog/ErrorDialog"

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
    this.inputEl.value = ""
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
    if (!this.currentTask)
      return
    try {
      let response = await fetch(`${config.urlPrefix}/api/add-task-attachment/${this.currentTask.id}`, {
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
        this.log.info("File successfully updloaded.")
      else
        this.log.error("Error while uploading image.")
    } catch (err) {
      this.log.warn(err)
    }
  }

  private addFile(f: FileInfoModel) {
    let view = render(itemTemplate, document.createElement("div"))
    let el = view.nodes[0] as HTMLElement

    let downloadBtn = el.querySelector(".js-download-button") as HTMLButtonElement
    downloadBtn.addEventListener("click", (ev) => {
      window.open(`${config.urlPrefix}/download-file/${f.id}`)
    })

    let deleteBtn = el.querySelector(".js-remove-button") as HTMLButtonElement
    deleteBtn.addEventListener("click", ev => {
      let contributorId = this.model.session.contributor.id
      if (f.uploaderId === contributorId && this.removeTaskAttachment(f.id))
        this.listEl.removeChild(el)
    })

    view.update({ name: f.name })
    this.listEl.appendChild(el)
  }

  private async removeTaskAttachment(fId: string) {
    if (!this.currentTask)
      return false
    let taskId = this.currentTask.id
    let result = false

    try {
      let response = await fetch(`${config.urlPrefix}/api/del-task-attachment/${taskId}/${fId}`, {
        method: "post",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      })

      if (!response.ok)
        this.log.error("Unable to get a response from server...")
      else {
        let data = await response.json()
        if (data.done) {
          this.log.info("Attachment successfully removed")
          result = true
        } else
          this.log.warn("Attachment not deleted")
      }
    } catch (err) {
      this.log.warn(err)
    }

    return result
  }

  private showSpinner() {
    this.spinnerEl.style.display = "inline"
  }

  private hideSpinner() {
    this.spinnerEl.style.display = "none"
  }
}
