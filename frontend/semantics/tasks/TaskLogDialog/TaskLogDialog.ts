import { Dash, Log } from "bkb"
import App from "../../../App/App"
import { Model, TaskModel, UpdateModelEvent, TaskLogEntryModel } from "../../../AppModel/AppModel"
import { render } from "monkberry"
import { removeAllChildren } from "../../../libraries/utils"

const template = require("./TaskLogDialog.monk")

export default class TaskLogDialog {
  readonly el: HTMLDialogElement
  private closeButtonEl: HTMLButtonElement
  private tableEl: HTMLTableElement
  private loadIndicatorEl: HTMLElement

  private view: MonkberryView

  private model: Model
  private task: TaskModel | undefined = undefined

  // Used to know if the logs for the current task need to loaded from model.
  private needReload = false

  private log: Log

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log
    this.el = this.createView()

    this.dash.listenTo(this.model, "createTaskLogEntry").onData(data => {
      let entry = data.model as TaskLogEntryModel
      if (!this.task || this.task.id !== entry.taskId)
        return
      this.addEntry(entry)
    })
  }

  private createView(): HTMLDialogElement {
    this.view = render(template, document.createElement("div"))
    let el = this.view.nodes[0] as HTMLDialogElement

    this.closeButtonEl = el.querySelector(".js-close") as HTMLButtonElement
    this.closeButtonEl.addEventListener("click", ev => this.hide())

    this.loadIndicatorEl = el.querySelector(".js-loader") as HTMLElement
    this.tableEl = el.querySelector(".js-table") as HTMLTableElement

    document.body.appendChild(el)

    return el
  }

  public async setTask(task: TaskModel | undefined) {
    this.task = task
    removeAllChildren(this.tableEl.tBodies[0])
    this.needReload = (task !== undefined)
  }

  private addEntry(entry: TaskLogEntryModel) {
    let row = this.tableEl.tBodies[0].insertRow(-1)

    row.insertCell(-1).textContent = entry.id
    row.insertCell(-1).textContent = new Date(entry.entryTs).toLocaleTimeString()
    row.insertCell(-1).textContent = entry.step.label
    row.insertCell(-1).textContent = entry.contributor.login
  }

  get currentTask(): TaskModel | undefined {
    return this.currentTask
  }

  public show() {
    this.el.showModal()
    if (this.needReload)
      this.loadTaskLogEntries()
    else
      this.loadIndicatorEl.style.display = "none"
  }

  public hide() {
    this.el.close()
  }

  private async loadTaskLogEntries() {
    if (!this.task)
      return

    this.loadIndicatorEl.style.display = "block"
    try {
      let entries = await this.task.getLogEntries()
      entries.forEach(entry => this.addEntry(entry))
    } catch (err) {
      this.log.error(`Cannot get log entries for task ${this.task.id}`)
    }
    this.loadIndicatorEl.style.display = "none"
  }

}
