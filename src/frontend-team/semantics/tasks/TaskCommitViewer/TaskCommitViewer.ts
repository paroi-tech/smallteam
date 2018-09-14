import { render } from "@fabtom/lt-monkberry"
import { Log } from "bkb"
import { removeAllChildren } from "../../../../sharedFrontend/libraries/utils"
import { OwnDash } from "../../../App/OwnDash"
import { TaskModel } from "../../../AppModel/AppModel"
import { GitCommitModel } from "../../../AppModel/Models/GitCommitModel"

const template = require("./TaskCommitViewer.monk")

export default class TaskCommitViewer {
  readonly el: HTMLElement
  private tableEl: HTMLTableElement

  private log: Log

  private task?: TaskModel

  constructor(private dash: OwnDash) {
    this.log = this.dash.app.log

    let view = render(template)

    this.el = view.rootEl()
    this.tableEl = view.ref("table")
  }

  setTask(task?: TaskModel) {
    this.task = task
    removeAllChildren(this.tableEl.tBodies[0])
    if (!task || (!task.gitCommits || task.gitCommits.length === 0))
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
}
