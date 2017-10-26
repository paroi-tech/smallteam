import { Dash, Log } from "bkb"
import { render } from "monkberry"
import { Model, TaskModel, UpdateModelEvent, CommentModel } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { CommentCreateFragment } from "../../../../isomorphic/meta/Comment"
import { removeAllChildren } from "../../../libraries/utils"
import { Converter } from "showdown"

const template = require("./TaskComment.monk")

const editText = "\u{270E}"
const saveText = "\u{1F4BE}"

export default class TaskComment {
  readonly el: HTMLElement

  private editButtonEl: HTMLButtonElement
  private cancelButtonEl: HTMLButtonElement
  private deleteButtonEl: HTMLButtonElement
  private textareaEl: HTMLTextAreaElement
  private contentEl: HTMLElement

  private view: MonkberryView

  private converter: Converter

  private model: Model
  private log: Log
  private contributorId: string

  private editMode = false

  constructor(private dash: Dash<App>, private comment: CommentModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log
    this.contributorId = this.dash.app.model.session.contributor.id

    this.el = this.createView()
    this.converter = new Converter()
    this.contentEl.innerHTML = this.converter.makeHtml(this.comment.body)

    this.listenToModel()
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"))
    let el = this.view.nodes[0] as HTMLElement

    this.editButtonEl = el.querySelector(".js-edit") as HTMLButtonElement
    this.cancelButtonEl = el.querySelector(".js-cancel") as HTMLButtonElement
    this.deleteButtonEl = el.querySelector(".js-delete") as HTMLButtonElement
    this.textareaEl = el.querySelector("textarea") as HTMLTextAreaElement
    this.contentEl = el.querySelector(".js-content") as HTMLElement

    this.editButtonEl.textContent = editText
    this.editButtonEl.addEventListener("click", ev => this.onBtnEditClick())
    this.cancelButtonEl.addEventListener("click", ev => this.onBtnCancelClick())
    this.deleteButtonEl.addEventListener("click", ev => this.onBtnDeleteClick())

    this.cancelButtonEl.style.display = "none" // Cancel button is hidden by default.

    if (this.contributorId != this.comment.writtenById)
      this.deleteButtonEl.style.display = "none" // Only the creator of a comment can edit it.

    return el
  }

  private listenToModel() {
    this.dash.listenTo<UpdateModelEvent>(this.model, "updateComment").onData(data => {
      let comment = data.model as CommentModel
      if (this.comment.id !== comment.id)
        return
      this.contentEl.innerHTML = this.converter.makeHtml(this.comment.body)
    })
  }

  private async onBtnEditClick() {
    if (this.comment.writtenById !== this.contributorId)
      return

    if (!this.editMode) {
      this.textareaEl.value = this.comment.body
      this.textareaEl.style.display = "block"
      this.cancelButtonEl.style.display = "block"
      this.editButtonEl.textContent = saveText
      this.editButtonEl.title = "Save changes"
    } else {
      let str = this.textareaEl.value.trim()
      if (str.length === 0)
        return

      try {
        await this.model.exec("update", "Comment", {
          id: this.comment.id,
          body: str
        })
      } catch (err) {
        this.log.error("Unable to update comment...")
        return
      }

      this.textareaEl.style.display = "none"
      this.cancelButtonEl.style.display = "none"
      this.editButtonEl.textContent = editText
      this.editButtonEl.title = "Edit comment"
    }
    this.editMode = !this.editMode
  }

  private onBtnCancelClick() {
    this.textareaEl.style.display = "none"
    this.cancelButtonEl.style.display = "none"
    this.editButtonEl.textContent = editText
    this.editButtonEl.title = "Edit comment"
    this.editMode = false
  }

  private async onBtnDeleteClick() {
    if (this.comment.writtenById !== this.contributorId)
      return
    if (!confirm("Do you really want to remove this comment?"))
      return

    try {
      this.model.exec("delete", "Comment", {
        id: this.comment.id
      })
    } catch (err) {
      this.log.error(`Cannot delete comment with ID ${this.comment.id}`)
    }
  }
}
