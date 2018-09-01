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

    view.ref("close").addEventListener("click", ev => this.close())
    this.el.addEventListener("cancel", ev => {
      ev.preventDefault()
      this.close()
    })
  }

  setTask(task: TaskModel) {
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

    let link = document.createElement("a")

    link.href = commit.url
    link.target = "_blank"
    link.textContent = "Visit"
    row.insertCell().appendChild(link)
  }

  reset() {
    this.task = undefined
    removeAllChildren(this.tableEl.tBodies[0])
  }

  show() {
    document.body.appendChild(this.el)
    this.el.showModal()
  }

  close() {
    this.el.close()
    document.body.removeChild(this.el)
  }
}
