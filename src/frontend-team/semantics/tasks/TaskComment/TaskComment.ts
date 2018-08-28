import { Log } from "bkb"
import { render, LtMonkberryView } from "@fabtom/lt-monkberry"
import { Model, CommentModel } from "../../../AppModel/AppModel"
import { Converter } from "showdown"
import { OwnDash } from "../../../App/OwnDash";

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

  private view: LtMonkberryView
  private state = {
    author: "",
    modificationDate: ""
  }

  private converter: Converter

  private model: Model
  private log: Log
  private accountId: string

  private editMode = false

  constructor(private dash: OwnDash, readonly comment: CommentModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log
    this.accountId = this.dash.app.model.session.account.id

    this.view = render(template)
    this.el = this.view.rootEl()
    this.editButtonEl = this.view.ref("edit")
    this.cancelButtonEl = this.view.ref("cancel")
    this.deleteButtonEl = this.view.ref("delete")
    this.textareaEl = this.view.ref("textarea")
    this.contentEl = this.view.ref("content")

    this.editButtonEl.textContent = editText
    this.editButtonEl.addEventListener("click", ev => this.onBtnEditClick())
    this.cancelButtonEl.addEventListener("click", ev => this.onBtnCancelClick())
    this.deleteButtonEl.addEventListener("click", ev => this.onBtnDeleteClick())

    this.cancelButtonEl.hidden = true // Cancel button is hidden by default.
    if (this.accountId != this.comment.writtenById) {
      // Only the creator of a comment can edit or delete it.
      this.deleteButtonEl.hidden = true
      this.editButtonEl.hidden = true
    }

    this.updateView()

    this.converter = new Converter()
    this.contentEl.innerHTML = this.converter.makeHtml(this.comment.body)

    this.dash.listenToModel("updateComment", data => {
      let comment = data.model as CommentModel
      if (this.comment.id !== comment.id)
        return
      this.updateView()
      this.contentEl.innerHTML = this.converter.makeHtml(this.comment.body)
    })
  }

  private updateView() {
    this.state.author = this.comment.writtenBy.login
    let d = new Date(this.comment.updateTs)
    this.state.modificationDate = `${d.toLocaleDateString()}@${d.toLocaleTimeString()}`
    this.view.update(this.state)
  }

  private async onBtnEditClick() {
    if (this.comment.writtenById !== this.accountId)
      return

    if (!this.editMode) {
      this.textareaEl.value = this.comment.body
      this.textareaEl.hidden = false
      this.cancelButtonEl.hidden = false
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

      this.textareaEl.hidden = true
      this.cancelButtonEl.hidden = true
      this.editButtonEl.textContent = editText
      this.editButtonEl.title = "Edit comment"
    }
    this.editMode = !this.editMode
  }

  private onBtnCancelClick() {
    this.textareaEl.hidden = true
    this.cancelButtonEl.hidden = true
    this.editButtonEl.textContent = editText
    this.editButtonEl.title = "Edit comment"
    this.editMode = false
  }

  private async onBtnDeleteClick() {
    if (this.comment.writtenById !== this.accountId)
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
