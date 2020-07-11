import { removeAllChildren } from "@smallteam-local/shared-ui/libraries/utils"
import { Log } from "bkb"
import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { TaskModel } from "../../AppModel/AppModel"
import { GitCommitModel } from "../../AppModel/Models/GitCommitModel"

const template = handledom`
<div class="TaskCommitViewer">
  <table h="table">
    <thead>
      <tr>
        <td>Author</td>
        <td>Message</td>
        <td>Date</td>
        <td>URL</td>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</div>
`

export default class TaskCommitViewer {
  readonly el: HTMLElement
  private tableEl: HTMLTableElement

  private log: Log

  private task?: TaskModel

  constructor(private dash: OwnDash) {
    this.log = this.dash.app.log

    const { root, ref } = template()

    this.el = root
    this.tableEl = ref("table")
  }

  setTask(task?: TaskModel) {
    this.task = task
    removeAllChildren(this.tableEl.tBodies[0])
    if (!task || (!task.gitCommits || task.gitCommits.length === 0))
      return
    for (const commit of task.gitCommits)
      this.showCommit(commit)
  }

  private showCommit(commit: GitCommitModel) {
    const row = this.tableEl.tBodies[0].insertRow()

    row.insertCell().textContent = commit.authorName
    row.insertCell().textContent = commit.message
    row.insertCell().textContent = new Date(commit.ts).toDateString()

    const link = document.createElement("a")

    link.href = commit.url
    link.target = "_blank"
    link.textContent = "Visit"
    row.insertCell().appendChild(link)
  }
}
