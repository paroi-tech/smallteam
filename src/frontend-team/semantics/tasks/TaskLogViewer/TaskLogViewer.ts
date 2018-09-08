import { Log } from "bkb"
import { Model, TaskModel, TaskLogEntryModel } from "../../../AppModel/AppModel"
import { render } from "@fabtom/lt-monkberry"
import { OwnDash } from "../../../App/OwnDash"
import { removeAllChildren } from "../../../../sharedFrontend/libraries/utils"

const template = require("./TaskLogViewer.monk")

export default class TaskLogViewer {
  readonly el: HTMLElement
  private tableEl: HTMLTableElement
  private loadIndicatorEl: HTMLElement

  private model: Model
  private task?: TaskModel
  private log: Log

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    let view = render(template)

    this.el = view.rootEl()
    this.loadIndicatorEl = view.ref("loader")
    this.tableEl = view.ref("table")

    this.dash.listenTo(this.model, "createTaskLogEntry", data => {
      let entry = data.model as TaskLogEntryModel
      if (!this.task || this.task.id !== entry.taskId)
        return
      this.addEntry(entry)
    })

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  getTask() {
    return this.task
  }

  setTask(task?: TaskModel) {
    this.task = task
    removeAllChildren(this.tableEl.tBodies[0])
    this.loadTaskLogEntries()
  }

  private addEntry(entry: TaskLogEntryModel) {
    let row = this.tableEl.tBodies[0].insertRow(-1)
    row.insertCell(-1).textContent = entry.id
    row.insertCell(-1).textContent = new Date(entry.entryTs).toLocaleTimeString()
    row.insertCell(-1).textContent = entry.step.label
    row.insertCell(-1).textContent = entry.account.login
  }

  private async loadTaskLogEntries() {
    if (!this.task)
      return
    this.loadIndicatorEl.hidden = false
    try {
      let entries = await this.task.getLogEntries()
      for (let entry of entries)
        this.addEntry(entry)
    } catch (err) {
      this.log.error(`Cannot get log entries for task ${this.task.id}`)
    }
    this.loadIndicatorEl.hidden = true
  }
}
