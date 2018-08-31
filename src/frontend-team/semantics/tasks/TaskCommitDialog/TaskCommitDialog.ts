import { OwnDash } from "../../../App/OwnDash"
import { Log } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import { TaskModel } from "../../../AppModel/AppModel"
import { GitCommitModel } from "../../../AppModel/Models/GitCommitModel"
import { removeAllChildren } from "../../../../sharedFrontend/libraries/utils"

const template = require("./TaskCommitDialog.monk")

export default class TaskCommitDialog {
  readonly el: HTMLDialogElement
  private tableEl: HTMLTableElement

  private log: Log

  private task?: TaskModel

  constructor(private dash: OwnDash) {
    this.log = this.dash.app.log

    let view = render(template)

    this.el = view.rootEl()
    this.tableEl = view.ref("table")
  }

  public setTask(task: TaskModel) {
    this.reset()
    if (!task)
      return

    this.task = task
    if (!task.gitCommits || task.gitCommits.length === 0)
      return
    for (let commit of task.gitCommits)
      this.showCommit(commit)
  }

  private showCommit(commit: GitCommitModel) {
    let row = this.tableEl.tBodies[0].insertRow()

    row.insertCell().textContent = commit.authorName
    row.insertCell().textContent = commit.message
    row.insertCell().textContent = new Date(commit.ts).toDateString()
    row.insertCell().textContent = new Date(commit.ts).toDateString()
  }

  public reset() {
    this.task = undefined
    removeAllChildren(this.tableEl.tBodies[0])
  }

  public show() {
    document.body.appendChild(this.el)
    this.el.showModal()
  }

  public hide() {
    this.el.close()
    document.body.removeChild(this.el)
  }
}
