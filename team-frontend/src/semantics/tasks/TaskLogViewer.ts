import { Log } from "bkb"
import handledom from "handledom"
import { removeAllChildren } from "../../../../shared-ui/libraries/utils"
import { OwnDash } from "../../AppFrame/OwnDash"
import { Model, TaskLogEntryModel, TaskModel } from "../../AppModel/AppModel"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
@import "../shared-ui/theme/definitions";

.TaskLogViewer {
  &-table {
    margin: 5px auto;
    width: 95%;
    caption {
      font-size: $f18;
      font-weight: bold;
    }
    thead {
      font-weight: bold;
    }
    td {
      padding: 5px;
    }
    tr {
      border-bottom: 1px steelblue solid;
    }
  }
}

.TaskLogViewerLoader {
  margin: 4px 0px;
  text-align: center;
  &-l {
    height: 50px;
    margin: 30px auto 0;
    width: 25%;
  }
}
`

const template = handledom`
<div class="TaskLogViewer">
  <div class="TaskLogViewerLoader" h="loader">
    <p>Loading logs</p>
    <div class="TaskLogViewerLoader-l LoaderBg"></div>
  </div>

  <table class="TaskLogViewer-table" h="table">
    <thead>
      <tr>
        <td>ID</td>
        <td>Date</td>
        <td>Step</td>
        <td>Account</td>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</div>
`

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

    const { root, ref } = template()

    this.el = root
    this.loadIndicatorEl = ref("loader")
    this.tableEl = ref("table")

    this.dash.listenTo(this.model, "createTaskLogEntry", data => {
      const entry = data.model as TaskLogEntryModel
      if (!this.task || this.task.id !== entry.taskId)
        return
      this.addEntry(entry)
    })
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
    const row = this.tableEl.tBodies[0].insertRow()

    row.insertCell().textContent = entry.id
    row.insertCell().textContent = new Date(entry.entryTs).toLocaleTimeString()
    row.insertCell().textContent = entry.step.label
    row.insertCell().textContent = entry.account.login
  }

  private async loadTaskLogEntries() {
    if (!this.task)
      return
    this.loadIndicatorEl.hidden = false
    try {
      const entries = await this.task.getLogEntries()
      for (const entry of entries)
        this.addEntry(entry)
    } catch (err) {
      this.log.error(`Cannot get log entries for task ${this.task.id}`)
    }
    this.loadIndicatorEl.hidden = true
  }
}
