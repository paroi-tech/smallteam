import { Dash, Log } from "bkb"
import App from "../../../App/App"
import { Model, TaskModel, UpdateModelEvent, TaskLogEntryModel } from "../../../AppModel/AppModel"
import { render } from "@fabtom/lt-monkberry"
import { removeAllChildren } from "../../../libraries/utils"
import { OwnDash } from "../../../App/OwnDash"

const template = require("./TaskLogDialog.monk")

export default class TaskLogDialog {
  readonly el: HTMLDialogElement
  private tableEl: HTMLTableElement
  private loadIndicatorEl: HTMLElement

  private model: Model
  private currentTask: TaskModel | undefined
  private log: Log

  // Used to know if the logs for the current task need to loaded from model.
  private needReload = false

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    let view = render(template)
    this.el = view.rootEl()
    this.loadIndicatorEl = view.ref("loader")
    this.tableEl = view.ref("table")
    view.ref("close").addEventListener("click", ev => this.hide())

    this.dash.listenTo(this.model, "createTaskLogEntry", data => {
      let entry = data.model as TaskLogEntryModel
      if (!this.currentTask || this.currentTask.id !== entry.taskId)
        return
      this.addEntry(entry)
    })

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())

    document.body.appendChild(this.el)
  }

  get task(): TaskModel | undefined {
    return this.task
  }

  set task(task: TaskModel | undefined) {
    this.currentTask = task
    this.needReload = (task !== undefined)
    removeAllChildren(this.tableEl.tBodies[0])
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

  private addEntry(entry: TaskLogEntryModel) {
    let row = this.tableEl.tBodies[0].insertRow(-1)
    row.insertCell(-1).textContent = entry.id
    row.insertCell(-1).textContent = new Date(entry.entryTs).toLocaleTimeString()
    row.insertCell(-1).textContent = entry.step.label
    row.insertCell(-1).textContent = entry.contributor.login
  }

  private async loadTaskLogEntries() {
    if (!this.currentTask)
      return
    this.loadIndicatorEl.style.display = "block"
    try {
      let entries = await this.currentTask.getLogEntries()
      entries.forEach(entry => this.addEntry(entry))
    } catch (err) {
      this.log.error(`Cannot get log entries for task ${this.currentTask.id}`)
    }
    this.loadIndicatorEl.style.display = "none"
  }
}
