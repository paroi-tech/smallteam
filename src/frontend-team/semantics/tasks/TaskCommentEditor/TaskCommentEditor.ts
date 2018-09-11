import { Log } from "bkb"
import { Model, TaskModel, CommentModel } from "../../../AppModel/AppModel"
import { CommentCreateFragment } from "../../../../shared/meta/Comment"
import TaskComment from "../TaskComment/TaskComment"
import { render } from "@fabtom/lt-monkberry"
import { OwnDash } from "../../../App/OwnDash"
import { removeAllChildren } from "../../../../sharedFrontend/libraries/utils";

import template = require("./TaskCommentEditor.monk")

export default class TaskCommentEditor {
  readonly el: HTMLElement
  private listEl: HTMLElement
  private textEl: HTMLTextAreaElement
  private spinnerEl: HTMLElement

  private listItems = new Map<string, HTMLElement>()

  private model: Model
  private task?: TaskModel
  private log: Log

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    let view = render(template)
    this.el = view.rootEl()
    this.listEl = view.ref("ul")
    this.textEl = view.ref("textarea")
    this.spinnerEl = view.ref("spinner")

    view.ref("submit").addEventListener("click", ev => {
      if (this.task)
        this.onSubmit()
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

    try {
      await this.model.exec("create", "Comment", frag)
      this.textEl.value = ""
    } catch (err) {
      this.log.error("Unable to create new comment")
    }
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
