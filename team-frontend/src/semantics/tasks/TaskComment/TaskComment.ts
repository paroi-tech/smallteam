require("./_TaskComment.scss")
import { Log } from "bkb"
import handledom from "handledom"
import { Converter } from "showdown"
import { QuestionDialog } from "../../../../../shared-ui/modalDialogs/modalDialogs"
import { OwnDash } from "../../../App/OwnDash"
import { CommentModel, Model } from "../../../AppModel/AppModel"

const template = handledom`
<div class="TaskComment">
  <div class="TaskComment-left">
    <div class="TaskComment-content">
      <span>{{ author }}, {{ date }}</span>
      <div h="markdown"></div>
    </div>
    <textarea class="TaskComment-textarea" h="text" value={{ text }}></textarea>
  </div>

  <div class="TaskComment-right" h="ifCanEdit"></div>
</div>
`

const buttonsTemplate = handledom`
<span>
  <button class="TaskComment-saveButton" title="Save changes" h="save"></button>
  <button class="TaskComment-cancelButton" title="Undo changes " h="cancel"></button>
  <button class="TaskComment-editButton" title="Edit comment" h="edit"></button>
  <button class="TaskComment-deleteButton" title="Delete comment" h="delete"></button>
</span>
`

export default class TaskComment {
  readonly el: HTMLElement
  private textareaEl: HTMLTextAreaElement
  private mdEl: HTMLElement

  private state = {
    author: "",
    date: "",
    text: "",
  }
  private showIfEditElements: HTMLElement[] = []
  private showIfNotEditElements: HTMLElement[] = []

  private converter: Converter

  private model: Model
  private log: Log

  constructor(private dash: OwnDash, readonly comment: CommentModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    let currentAccountId = this.dash.app.model.session.account.id
    let date = new Date(this.comment.updateTs)

    this.state.author = this.comment.writtenBy.login
    this.state.date = `${date.toLocaleDateString()}@${date.toLocaleTimeString()}`
    this.state.text = comment.body

    const { root, ref, update } = template(this.state)
    this.el = root
    this.textareaEl = ref("text")
    this.mdEl = ref("markdown")

    this.showIfEditElements.push(this.textareaEl)

    const canEdit = currentAccountId === comment.writtenById
    if (canEdit) {
      const { root: buttonsRoot, ref: buttonsRef } = buttonsTemplate()
      ref("ifCanEdit").appendChild(buttonsRoot)

      buttonsRef("edit").addEventListener("click", () => this.setEditMode(true))
      buttonsRef("save").addEventListener("click", () => this.onBtnSaveClick())
      buttonsRef("cancel").addEventListener("click", () => this.setEditMode(false))
      buttonsRef("delete").addEventListener("click", () => this.onBtnDeleteClick())
      this.showIfEditElements.push(
        buttonsRef("save"),
        buttonsRef("cancel"),
      )
      this.showIfNotEditElements.push(
        buttonsRef("edit"),
        buttonsRef("delete"),
      )
    }

    this.converter = new Converter()
    this.mdEl.innerHTML = this.converter.makeHtml(this.comment.body)

    this.dash.listenToModel("updateComment", data => {
      if (data.id !== this.comment.id)
        return
      let d = new Date(this.comment.updateTs)
      this.state.date = `${d.toLocaleDateString()}@${d.toLocaleTimeString()}`
      this.state.text = this.comment.body
      update(this.state)
      this.mdEl.innerHTML = this.converter.makeHtml(this.comment.body)
    })
  }

  private setEditMode(editMode: boolean) {
    this.showIfEditElements.forEach(el => el.hidden = !editMode)
    this.showIfNotEditElements.forEach(el => el.hidden = editMode)
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
      this.setEditMode(false)
    } catch (err) {
      this.log.error("Unable to update comment...")
    }
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
