import { Log } from "bkb"
import { Model, TaskModel, TaskLogEntryModel } from "../../../AppModel/AppModel"
import { render } from "@fabtom/lt-monkberry"
import { OwnDash } from "../../../App/OwnDash"
import { removeAllChildren } from "../../../../sharedFrontend/libraries/utils";

const template = require("./TaskLogDialog.monk")

export default class TaskLogDialog {
  readonly el: HTMLDialogElement
  private tableEl: HTMLTableElement
  private loadIndicatorEl: HTMLElement

  private model: Model
  private currentTask: TaskModel | undefined
  private log: Log

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
  }

  get task(): TaskModel | undefined {
    return this.task
  }

  set task(task: TaskModel | undefined) {
    this.currentTask = task
    removeAllChildren(this.tableEl.tBodies[0])
    this.loadTaskLogEntries()
  }

  public show() {
    document.body.appendChild(this.el)
    this.el.showModal()
  }

  public hide() {
    this.el.close()
    document.body.removeChild(this.el)
  }

  private addEntry(entry: TaskLogEntryModel) {
    let row = this.tableEl.tBodies[0].insertRow(-1)
    row.insertCell(-1).textContent = entry.id
    row.insertCell(-1).textContent = new Date(entry.entryTs).toLocaleTimeString()
    row.insertCell(-1).textContent = entry.step.label
    row.insertCell(-1).textContent = entry.account.login
  }

  private async loadTaskLogEntries() {
    if (!this.currentTask)
      return
    this.loadIndicatorEl.style.display = "block"
    try {
      let entries = await this.currentTask.getLogEntries()
      for (let entry of entries)
        this.addEntry(entry)
    } catch (err) {
      this.log.error(`Cannot get log entries for task ${this.currentTask.id}`)
    }
    this.loadIndicatorEl.style.display = "none"
  }
}
