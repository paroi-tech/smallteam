import { Dash, Log } from "bkb"
import App from "../../../App/App"
import { render } from "monkberry"
import { Model, TaskModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { removeAllChildren } from "../../../libraries/utils"
import { MediaModel } from "../../../AppModel/Models/MediaModel"
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

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.listEl = this.el.querySelector("ul") as HTMLElement
    this.formEl = this.el.querySelector("form") as HTMLFormElement
    this.inputEl = this.el.querySelector(".js-input") as HTMLInputElement
    this.uploadButtonEl = this.el.querySelector(".js-upload-button") as HTMLButtonElement
    this.spinnerEl = this.el.querySelector(".js-spinner") as HTMLElement
    this.formEl.onsubmit = (ev) => {
      ev.preventDefault()
      this.onFormSubmit()
    }
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
    if (!task || !task.attachedMedias)
      return
    for (let f of task.attachedMedias)
      this.addMedia(f)
  }

  private async onFormSubmit() {
    if (!this.inputEl.files || this.inputEl.files.length === 0)
      return
    this.showSpinner()
    await this.doUpload()
    this.hideSpinner()
  }

  private async doUpload() {
    if (!this.currentTask)
      return
    let meta = {
      ref: {
        type: "task",
        id: this.currentTask.id
      }
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
        this.log.info("File successfully updloaded.")
      else
        this.log.error("Error while uploading image.")
    } catch (err) {
      this.log.warn(err)
    }
  }

  private addMedia(media: MediaModel) {
    let view = render(itemTemplate, document.createElement("div"))
    let el = view.nodes[0] as HTMLElement

    let downloadBtn = el.querySelector(".js-download-button") as HTMLButtonElement
    downloadBtn.addEventListener("click", (ev) => {
      let orig = media.getVariant("orig")
      if (orig)
        window.open(`${orig.url}?download=1`)
    })

    let deleteBtn = el.querySelector(".js-remove-button") as HTMLButtonElement
    deleteBtn.addEventListener("click", ev => {
      let contributorId = this.model.session.contributor.id
      if (media.ownerId === contributorId && this.removeTaskAttachment(media.id))
        this.listEl.removeChild(el)
    })

    view.update({ name: media.baseName })
    this.listEl.appendChild(el)
  }

  private async removeTaskAttachment(mediaId: string) {
    if (!this.currentTask)
      return false

    let result = false

    try {
      let response = await fetch(`${config.urlPrefix}/medias/delete`, {
        method: "post",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mediaId })
      })

      if (!response.ok)
        this.log.error("Unable to get a response from server...")
      else {
        let data = await response.json()
        if (data.modelUpd)
          this.model.processModelUpdate(data.modelUpd)
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
