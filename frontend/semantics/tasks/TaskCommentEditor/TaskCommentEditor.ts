import { Dash } from "bkb"
import { render } from "monkberry"
import { Model, TaskModel, UpdateModelEvent, CommentModel } from "../../../AppModel/AppModel";
import App from "../../../App/App";
import { CommentCreateFragment } from "../../../../isomorphic/meta/Comment";
import { removeAllChildren } from "../../../libraries/utils";

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
  private task: TaskModel | undefined = undefined

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createView()
    this.listenToModel()
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement

    this.listEl = el.querySelector(".js-ul") as HTMLElement
    this.textAreaEl = el.querySelector("textarea") as HTMLTextAreaElement
    this.submitBtnEl = el.querySelector(".js-submit") as HTMLButtonElement
    this.submitBtnSpanEl = el.querySelector(".js-spinner") as HTMLElement

    this.submitBtnEl.addEventListener("click", ev => {
      if (this.task)
        this.onSubmit()
    })

    return el
  }

  private listenToModel() {
    this.dash.listenTo<UpdateModelEvent>(this.model, "createComment").onData(data => {
      if (!this.task)
        return
      let comment = data.model as CommentModel
      if (comment.taskId === this.task.id)
        this.addComment(comment)
    })

    this.dash.listenTo<UpdateModelEvent>(this.model, "updateComment").onData(data => {
      if (!this.task)
        return
      let comment = data.model as CommentModel
      if (comment.taskId === this.task.id) {
        let li = this.listItems.get(comment.id)
        if (!li)
          throw new Error(`Unable to find comment with ID ${comment.id}`)
        li.textContent = comment.body
      }
    })

    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteComment").onData(data => {
      if (!this.task)
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
    if (!this.task)
      return

    let text = this.textAreaEl.value.trim()
    if (text.length === 0)
      return

    let frag: CommentCreateFragment = {
      body: text,
      taskId: this.task.id
    }

    try {
      await this.model.exec("create", "Comment", frag)
      this.textAreaEl.value = ""
    } catch (err) {
      console.error("Unable to create new comment")
    }
  }

  public async setTask(task: TaskModel | undefined) {
    this.clear()
    this.task = task
    if (!task)
      return

    try {
      let comments = await task.getComments()
      for (let comment of comments)
        this.addComment(comment)
    } catch (err) {
      console.error("Unable to get task comments...", err)
    }
  }

  public addComment(comment: CommentModel) {
    let li = document.createElement("li")

    this.listItems.set(comment.id, li)
    li.textContent = comment.body
    this.listEl.appendChild(li)
  }

  private clear() {
    this.textAreaEl.value = ""
    removeAllChildren(this.listEl)
  }
}
