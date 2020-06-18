require("./_TaskCommentEditor.scss")
import { Log } from "bkb"
import handledom from "handledom"
import { removeAllChildren } from "../../../../../shared-ui/libraries/utils"
import { CommentCreateFragment } from "../../../../../shared/meta/Comment"
import { OwnDash } from "../../../App/OwnDash"
import { CommentModel, Model, TaskModel } from "../../../AppModel/AppModel"
import TaskComment from "../TaskComment/TaskComment"

const template = handledom`
<div class="TaskCommentEditor">
  <header class="TaskCommentEditor-header">Comments</header>
  <ul class="TaskCommentEditor-ul" h="ul"></ul>
  <button class="Btn TaskCommentEditor-button" h="btnToggle">{{ btnLabel }}
  </button>
  <div h="showIfText">
    <textarea class="TaskCommentEditor-textarea" rows="10" cols="25" h="textarea"></textarea>
    <button class="TaskCommentEditor-button Btn WithLoader -right" type="button" h="btnAdd">
      Save comment
      <span class="WithLoader-l" hidden h="spinner"></span>
    </button>
  </div>
</div>
`

export default class TaskCommentEditor {
  readonly el: HTMLElement
  private listEl: HTMLElement
  private textEl: HTMLTextAreaElement
  private spinnerEl: HTMLElement
  private showIfTextEl: HTMLElement

  private update: (args: any) => void
  private listItems = new Map<string, HTMLElement>()
  private showText = false

  private model: Model
  private task?: TaskModel
  private log: Log

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    const { root, ref, update } = template()
    this.el = root
    this.update = update

    this.showIfTextEl = ref("showIfText")
    this.listEl = ref("ul")
    this.textEl = ref("textarea")
    this.spinnerEl = ref("spinner")

    ref("btnAdd").addEventListener("click", () => {
      if (this.task)
        this.onSubmit()
    })

    ref("btnToggle").addEventListener("click", () => {
      this.setShowText(!this.showText)
    })

    this.dash.listenToModel("createComment", data => {
      if (!this.task)
        return
      let comment = data.model as CommentModel
      if (comment.taskId === this.task.id)
        this.addComment(comment)
    })

    this.dash.listenToModel("deleteComment", data => {
      if (!this.task)
        return
      let commentId = data.id as string
      let item = this.listItems.get(commentId)
      if (item) {
        this.listEl.removeChild(item)
        this.listItems.delete(commentId)
      }
    })
  }

  addComment(comment: CommentModel) {
    let li = document.createElement("li")

    this.listItems.set(comment.id, li)
    li.appendChild(this.dash.create(TaskComment, comment).el)
    this.listEl.appendChild(li)
  }

  getTask() {
    return this.task
  }

  setTask(task?: TaskModel) {
    this.task = task
    this.textEl.value = ""
    removeAllChildren(this.listEl)
    this.loadComments()
  }

  private setShowText(showText: boolean) {
    this.showText = showText
    this.update({
      btnLabel: showText ? "Hide ▴" : "Add comment ▾"
    })
    this.showIfTextEl.hidden = !showText
  }

  private async onSubmit() {
    if (!this.task)
      return

    let text = this.textEl.value.trim()

    if (text.length === 0)
      return

    let frag: CommentCreateFragment = {
      body: text,
      taskId: this.task.id
    }

    this.spinnerEl.hidden = false
    try {
      await this.model.exec("create", "Comment", frag)
      this.textEl.value = ""
    } catch (err) {
      this.log.error("Unable to create new comment")
    }
    this.spinnerEl.hidden = true
  }

  private async loadComments() {
    if (!this.task)
      return
    try {
      let comments = await this.task.getComments()
      for (let comment of comments)
        this.addComment(comment)
    } catch (err) {
      this.log.error("Unable to get task comments...", err)
    }
  }
}
