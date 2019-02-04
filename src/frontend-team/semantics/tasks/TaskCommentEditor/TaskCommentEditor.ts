import { LtMonkberryView, render } from "@tomko/lt-monkberry"
import { Log } from "bkb"
import { CommentCreateFragment } from "../../../../shared/meta/Comment"
import { removeAllChildren } from "../../../../sharedFrontend/libraries/utils"
import { OwnDash } from "../../../App/OwnDash"
import { CommentModel, Model, TaskModel } from "../../../AppModel/AppModel"
import { Show } from "../../../libraries/monkberryUtils"
import TaskComment from "../TaskComment/TaskComment"

const template = require("./TaskCommentEditor.monk")

export default class TaskCommentEditor {
  readonly el: HTMLElement
  private listEl: HTMLElement
  private textEl: HTMLTextAreaElement
  private spinnerEl: HTMLElement

  private view: LtMonkberryView
  private directives = {
    show: Show
  }

  private listItems = new Map<string, HTMLElement>()

  private model: Model
  private task?: TaskModel
  private log: Log

  private state = {
    showText: false
  }

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.view = render(template, { directives: this.directives })
    this.view.update(this.state)
    this.el = this.view.rootEl()
    this.listEl = this.view.ref("ul")
    this.textEl = this.view.ref("textarea")
    this.spinnerEl = this.view.ref("spinner")

    this.view.ref("btnAdd").addEventListener("click", () => {
      if (this.task)
        this.onSubmit()
    })

    this.view.ref("btnToggle").addEventListener("click", () => {
      this.state.showText = !this.state.showText
      this.view.update(this.state)
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
