import { Dash } from "bkb"
import { render } from "monkberry"
import { Box } from "../../../generics/BoxList/BoxList";
import { Model, FlagModel, UpdateModelEvent } from "../../../AppModel/AppModel";
import App from "../../../App/App"
import { OwnDash } from "../../../App/OwnDash";

const template = require("./FlagBox.monk")

export default class FlagBox implements Box {
  readonly el: HTMLElement

  private colorEl: HTMLElement

  private model: Model
  private view: MonkberryView

  constructor(private dash: OwnDash, readonly flag: FlagModel) {
    this.model = this.dash.app.model

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.colorEl = this.el.querySelector(".js-box-color") as HTMLElement
    this.colorEl.style.color = this.flag.color
    this.el.onclick = ev => this.dash.emit("flagBoxSelected", this.flag)
    this.view.update(this.flag)

    this.dash.listenToModel("updateFlag", data => {
      let flag = data.model as FlagModel
      if (flag.id === this.flag.id) {
        this.view.update(this.flag)
        this.colorEl.style.color = this.flag.color
      }
    })
  }

  public setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }

  get id(): string {
    return this.flag.id
  }
}
