import { Dash, Log } from "bkb"
import App from "../../../App/App"
import { Model, TaskModel, UpdateModelEvent, CommentModel } from "../../../AppModel/AppModel"
import { CommentCreateFragment } from "../../../../isomorphic/meta/Comment"
import TaskComment from "../TaskComment/TaskComment"
import { render } from "monkberry"
import { removeAllChildren } from "../../../libraries/utils"

const template = require("./TaskCommentEditor.monk")

export default class TaskCommentEditor {
  readonly el: HTMLElement
  private listEl: HTMLElement
  private textAreaEl: HTMLTextAreaElement
  private submitBtnEl: HTMLButtonElement
  private submitBtnSpanEl: HTMLElement

  private view: MonkberryView

  private listItems = new Map<string, HTMLElement>()

  private model: Model
  private currentTask: TaskModel | undefined = undefined
  private log: Log

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log
    this.el = this.createView()
    this.listenToModel()
  }

  public addComment(comment: CommentModel) {
    let li = document.createElement("li")

    this.listItems.set(comment.id, li)
    li.appendChild(this.dash.create(TaskComment, comment).el)
    this.listEl.appendChild(li)
  }

  get task(): TaskModel | undefined {
    return this.currentTask
  }

  set task(task: TaskModel | undefined) {
    this.reset()
    this.currentTask = task
    if (!task)
      return
    this.loadComments()
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement
    this.listEl = el.querySelector(".js-ul") as HTMLElement
    this.textAreaEl = el.querySelector("textarea") as HTMLTextAreaElement
    this.submitBtnEl = el.querySelector(".js-submit") as HTMLButtonElement
    this.submitBtnSpanEl = el.querySelector(".js-spinner") as HTMLElement

    this.submitBtnEl.addEventListener("click", ev => {
      if (this.currentTask)
        this.onSubmit()
    })

    return el
  }

  private listenToModel() {
    this.dash.listenTo<UpdateModelEvent>(this.model, "createComment").onData(data => {
      if (!this.currentTask)
        return
      let comment = data.model as CommentModel
      if (comment.taskId === this.currentTask.id)
        this.addComment(comment)
    })

    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteComment").onData(data => {
      if (!this.currentTask)
        return
      let commentId = data.id as string
      let li = this.listItems.get(commentId)
      if (li) {
        this.listEl.removeChild(li)
        this.listItems.delete(commentId)
      }
    })
  }

  private async onSubmit() {
    if (!this.currentTask)
      return

    let text = this.textAreaEl.value.trim()
    if (text.length === 0)
      return

    let frag: CommentCreateFragment = {
      body: text,
      taskId: this.currentTask.id
    }

    try {
      await this.model.exec("create", "Comment", frag)
      this.textAreaEl.value = ""
    } catch (err) {
      this.log.error("Unable to create new comment")
    }
  }

  private async loadComments() {
    if (!this.currentTask)
      return
    try {
      let comments = await this.currentTask.getComments()
      for (let comment of comments)
        this.addComment(comment)
    } catch (err) {
      this.log.error("Unable to get task comments...", err)
    }
  }

  private reset() {
    this.textAreaEl.value = ""
    removeAllChildren(this.listEl)
  }
}
