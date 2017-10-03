import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Box } from "../BoxList/BoxList"
import { Model, FlagModel } from "../AppModel/AppModel"
import { UpdateModelEvent } from "../AppModel/ModelEngine"
import { render } from "monkberry"

import * as template from "./flagbox.monk"

export default class FlagBox implements Box {
  readonly el: HTMLElement
  readonly id: string

  private colorEl: HTMLElement

  private model: Model
  private view: MonkberryView

  constructor(private dash: Dash<App>, readonly flag: FlagModel) {
    this.model = this.dash.app.model
    this.id = this.flag.id

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.colorEl = this.el.querySelector(".js-box-color") as HTMLElement
    this.colorEl.style.color = this.flag.color
    this.view.update(this.flag)

    this.listenToModel()
    this.el.onclick = ev => this.dash.emit("flagBoxSelected", this.flag)
  }

  private listenToModel() {
    this.dash.listenTo<UpdateModelEvent>(this.model, "updateFlag").onData(data => {
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
}
