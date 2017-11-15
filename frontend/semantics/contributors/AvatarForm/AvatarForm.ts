import { Dash } from "bkb"
import { render } from "monkberry"
import App from "../../../App/App"
import { Model, ContributorModel } from "../../../AppModel/AppModel"

const template = require("./AvatarForm.monk")

export default class AvatarForm {
  readonly el: HTMLElement
  private inputEl: HTMLInputElement
  private buttonEl: HTMLButtonElement

  private model: Model

  private view: MonkberryView

  constructor(private dash: Dash<App>, readonly contributor: ContributorModel) {
    this.model = this.dash.app.model
    this.el = this.createView()
  }

  private createView() {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement
    this.buttonEl = el.querySelector("button") as HTMLButtonElement
    this.inputEl = el.querySelector(".js-input") as HTMLInputElement
    this.buttonEl.addEventListener("click", ev => this.onSubmit())

    return el
  }

  private async onSubmit() {
    if (!this.inputEl.files)
      return

    let fd = new FormData()
    fd.append("avatar", this.inputEl.files[0])

  }
}
