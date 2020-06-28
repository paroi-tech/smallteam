import { Log } from "bkb"
import handledom from "handledom"
import { Converter } from "showdown"
import QuestionDialog from "../../../../shared-ui/modal-dialogs/QuestionDialog"
import { OwnDash } from "../../AppFrame/OwnDash"
import { CommentModel, Model } from "../../AppModel/AppModel"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.TaskComment {
  display: flex;

  &-left {
    flex-grow: 1;
    min-height: 60px;
    overflow: scroll;
    position: relative;
  }

  &-textarea {
    border: 1px solid #708090;
    bottom: 0;
    height: 100%;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
    z-index: 1;
  }

  &-content {
    z-index: 0;
  }

  &-right {
    display: flex;
    flex-direction: column;
    flex-grow: 0;
    justify-content: flex-start;
  }

  &-editButton, &-cancelButton, &-saveButton, &-deleteButton {
    background-position: center;
    background-size: cover;
    border: 0;
    flex-grow: 0;
    height: 16px;
    margin: 2px;
    outline: none;
    width: 16px;
  }

  &-editButton {
    background-image: url(/svg/feather/edit.svg);
  }

  &-cancelButton {
    background-image: url(/svg/feather/x-circle.svg);
  }

  &-saveButton {
    background-image: url(/svg/feather/save.svg);
  }

  &-deleteButton {
    background-image: url(/svg/feather/trash-2.svg);
  }
}
`

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
    text: ""
  }
  private showIfEditElements: HTMLElement[] = []
  private showIfNotEditElements: HTMLElement[] = []

  private converter: Converter

  private model: Model
  private log: Log

  constructor(private dash: OwnDash, readonly comment: CommentModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    const currentAccountId = this.dash.app.model.session.account.id
    const date = new Date(this.comment.updateTs)

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
        buttonsRef("cancel")
      )
      this.showIfNotEditElements.push(
        buttonsRef("edit"),
        buttonsRef("delete")
      )
    }

    this.converter = new Converter()
    this.mdEl.innerHTML = this.converter.makeHtml(this.comment.body)

    this.dash.listenToModel("updateComment", data => {
      if (data.id !== this.comment.id)
        return
      const d = new Date(this.comment.updateTs)
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
    const str = this.textareaEl.value.trim()

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
      await this.model.exec("delete", "Comment", {
        id: this.comment.id
      })
    } catch (err) {
      this.log.error(`Cannot delete comment with ID ${this.comment.id}`)
    }
  }
}
