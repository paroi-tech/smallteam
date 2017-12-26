import { Dash } from "bkb"
import App from "../../../App/App"
import { render } from "monkberry"
import { Model, TaskModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { removeAllChildren } from "../../../libraries/utils"
import { FileInfoModel } from "../../../AppModel/Models/FileInfoModel"

const template = require("./TaskAttachmentManager.monk")
const itemTemplate = require("./item.monk")

export default class TaskAttachmentManager {
  readonly el: HTMLElement
  private listEl: HTMLElement
  private uploadButtonEl: HTMLButtonElement

  private model: Model
  private currentTask: TaskModel | undefined

  private view: MonkberryView

  constructor(private dash: Dash) {
    this.model = this.dash.app.model
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
    this.uploadButtonEl = el.querySelector(".js-upload-button") as HTMLButtonElement
    this.uploadButtonEl.addEventListener("click", ev => this.onUploadButtonClick())

    return el
  }

  private onUploadButtonClick() {

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
}
