import { LtMonkberryView, render } from "@fabtom/lt-monkberry"
import { Log } from "bkb"
import { Converter } from "showdown"
import { QuestionDialog } from "../../../../sharedFrontend/modalDialogs/modalDialogs"
import { OwnDash } from "../../../App/OwnDash"
import { CommentModel, Model } from "../../../AppModel/AppModel"
import { Show } from "../../../libraries/monkberryUtils"

const template = require("./TaskComment.monk")

export default class TaskComment {
  readonly el: HTMLElement
  private textareaEl: HTMLTextAreaElement
  private mdEl: HTMLElement

  private view: LtMonkberryView
  private directives = {
    show: Show
  }
  private state = {
    author: "",
    date: "",
    text: "",
    canEdit: false,
    editMode: false
  }

  private converter: Converter

  private model: Model
  private log: Log

  constructor(private dash: OwnDash, readonly comment: CommentModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    let currentAccountId = this.dash.app.model.session.account.id
    let date = new Date(this.comment.updateTs)

    this.view = render(template, { directives: this.directives })
    this.state.author = this.comment.writtenBy.login
    this.state.date = `${date.toLocaleDateString()}@${date.toLocaleTimeString()}`
    this.state.canEdit = currentAccountId === comment.writtenById
    this.state.text = comment.body
    this.view.update(this.state)

    this.el = this.view.rootEl()
    this.textareaEl = this.view.ref("text")
    this.mdEl = this.view.ref("markdown")
    if (this.state.canEdit) {
      this.view.ref("edit").addEventListener("click", () => this.onBtnEditClick())
      this.view.ref("save").addEventListener("click", () => this.onBtnSaveClick())
      this.view.ref("cancel").addEventListener("click", () => this.onBtnCancelClick())
      this.view.ref("delete").addEventListener("click", () => this.onBtnDeleteClick())
    }

    this.converter = new Converter()
    this.mdEl.innerHTML = this.converter.makeHtml(this.comment.body)

    this.dash.listenToModel("updateComment", data => {
      if (data.id !== this.comment.id)
        return
      let d = new Date(this.comment.updateTs)
      this.state.date = `${d.toLocaleDateString()}@${d.toLocaleTimeString()}`
      this.state.text = this.comment.body
      this.view.update(this.state)
      this.mdEl.innerHTML = this.converter.makeHtml(this.comment.body)
    })
  }

  private async onBtnEditClick() {
    this.state.editMode = true
    this.view.update(this.state)
  }

  private async onBtnSaveClick() {
    let str = this.textareaEl.value.trim()

    if (str.length === 0)
      return

    try {
      await this.model.exec("update", "Comment", {
        id: this.comment.id,
        body: str
      })
      this.state.editMode = false
      this.view.update(this.state)
    } catch (err) {
      this.log.error("Unable to update comment...")
    }
  }

  private onBtnCancelClick() {
    this.state.editMode = false
    this.view.update(this.state)
  }

  private async onBtnDeleteClick() {
    // TODO: use custom modal dialogs...
    if (!await this.dash.create(QuestionDialog).show("Do you really want to remove this comment?"))
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
