import { render } from "@fabtom/lt-monkberry"
import { Log } from "bkb"
import { removeAllChildren } from "../../../../sharedFrontend/libraries/utils"
import { ErrorDialog } from "../../../../sharedFrontend/modalDialogs/modalDialogs"
import { OwnDash } from "../../../App/OwnDash"
import { Model, TaskModel } from "../../../AppModel/AppModel"
import { MediaModel } from "../../../AppModel/Models/MediaModel"
import FileThumbnail from "../../../generics/FileThumbnail/FileThumbnail"

const template = require("./TaskAttachmentManager.monk")
const mediaTemplate = require("./media.monk")

export default class TaskAttachmentManager {
  readonly el: HTMLElement
  private listEl: HTMLElement
  private formEl: HTMLFormElement
  private inputEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private model: Model
  private currentTask?: TaskModel
  private log: Log

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    let view = render(template)

    this.el = view.rootEl()
    this.listEl = view.ref("ul")
    this.formEl = view.ref("form")
    this.inputEl = view.ref("input")
    this.spinnerEl = view.ref("spinner")
    this.formEl.onsubmit = (ev) => {
      ev.preventDefault()
      this.onFormSubmit()
    }

    this.dash.listenToModel("updateTask", task => {
      if (this.currentTask && this.currentTask.id === task.id)
        this.refreshMediaList()
    })
  }

  get task() {
    return this.currentTask
  }

  setTask(task?: TaskModel) {
    this.currentTask = task
    this.inputEl.value = ""
    this.refreshMediaList()
  }

  private refreshMediaList() {
    removeAllChildren(this.listEl)
    this.listAttachedMedias()
  }

  private listAttachedMedias() {
    if (!this.currentTask || !this.currentTask.attachedMedias)
      return
    for (let media of this.currentTask.attachedMedias)
      this.displayMedia(media)
  }

  private displayMedia(media: MediaModel) {
    let view = render(mediaTemplate)
    let el = view.rootEl()
    let thumbnail = this.dash.create(FileThumbnail, {
      media,
      width: 24,
      height: 24
    })

    view.ref("thumbnail").appendChild(thumbnail.el)
    view.ref("download").addEventListener("click", () => {
      let orig = media.getVariant("orig")
      if (orig)
        window.open(`${orig.url}?download=1`)
    })
    view.ref("remove").addEventListener("click", () => {
      let accountId = this.model.session.account.id
      if (media.ownerId === accountId && this.removeTaskAttachment(media.id))
        this.listEl.removeChild(el)
    })
    view.update({ name: media.originalName || media.baseName })
    this.listEl.appendChild(el)
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
      let response = await fetch(`${this.dash.app.baseUrl}/medias/upload`, {
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
        this.inputEl.value = ""
      else
        this.log.error("Error while uploading image.")
    } catch (err) {
      this.log.warn(err)
    }
  }

  private async removeTaskAttachment(mediaId: string) {
    if (!this.currentTask)
      return false

    let result = false

    try {
      let response = await fetch(`${this.dash.app.baseUrl}/medias/delete`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ mediaId })
      })

      if (!response.ok) {
        this.log.error("Unable to get a response from server...")
        return false
      }

      let data = await response.json()

      if (data.modelUpd)
        this.model.processModelUpdate(data.modelUpd)

      if (data.done)
        result = true
      else
        this.log.warn("Attachment not deleted")
    } catch (err) {
      this.log.warn(err)
    }

    return result
  }

  private showSpinner() {
    this.spinnerEl.hidden = false
  }

  private hideSpinner() {
    this.spinnerEl.hidden = true
  }
}
