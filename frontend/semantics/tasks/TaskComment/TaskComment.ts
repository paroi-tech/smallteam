import { Dash } from "bkb"
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
  private textareaEl: HTMLTextAreaElement
  private contentEl: HTMLElement

  private view: MonkberryView

  private converter: Converter

  private editMode = false

  constructor(private dash: Dash<App>, private comment: CommentModel) {
    this.el = this.createView()
    this.converter = new Converter()
    this.contentEl.innerHTML = this.converter.makeHtml(this.comment.body)
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"))
    let el = this.view.nodes[0] as HTMLElement

    this.editButtonEl = el.querySelector(".js-edit") as HTMLButtonElement
    this.cancelButtonEl = el.querySelector(".js-cancel") as HTMLButtonElement
    this.textareaEl = el.querySelector("textarea") as HTMLTextAreaElement
    this.contentEl = el.querySelector(".js-content") as HTMLElement

    this.editButtonEl.textContent = editText
    this.editButtonEl.addEventListener("click", ev => this.onBtnEditClick())

    this.cancelButtonEl.addEventListener("click", ev => this.onBtnCancelClick())

    return el
  }

  private onBtnEditClick() {
    if (!this.editMode) {
      this.textareaEl.style.display = "block"
      this.cancelButtonEl.style.display = "block"
      this.editButtonEl.textContent = saveText
    } else {
      // TODO: Save the changes in the model.
      this.textareaEl.style.display = "none"
      this.cancelButtonEl.style.display = "none"
      this.editButtonEl.textContent = editText
    }
    this.editMode = !this.editMode
  }

  private onBtnCancelClick() {
    this.textareaEl.style.display = "none"
    this.cancelButtonEl.style.display = "none"
    this.editButtonEl.textContent = editText
    this.editMode = false
  }
}
