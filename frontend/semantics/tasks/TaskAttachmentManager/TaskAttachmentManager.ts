import { Dash } from "bkb"
import App from "../../../App/App"
import { render } from "monkberry"
import { Model, TaskModel, UpdateModelEvent } from "../../../AppModel/AppModel"

const template = require("./TaskAttachmentManager.monk")
const itemTemplate = require("./item.monk")

export default class TaskAttachmentManager {
  readonly el: HTMLElement

  private model: Model
  private currentTask: TaskModel | undefined

  private view: MonkberryView

  constructor(private dash: Dash) {
    this.model = this.dash.app.model
  }

  private createView() {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement

    return el
  }

  get task(): TaskModel | undefined {
    return this.currentTask
  }

  set task(task: TaskModel | undefined) {
    this.currentTask = task
  }
}
