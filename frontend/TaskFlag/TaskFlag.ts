import App from "../App/App"
import { Dash, Bkb } from "bkb"
import { Model, FlagModel } from "../AppModel/AppModel"
import { UpdateModelEvent } from "../AppModel/ModelEngine"
import { render } from "monkberry"

import * as template from "./taskflag.monk"

export default class TaskFlag {
  readonly el: HTMLElement

  private view: MonkberryView

  private model: Model

  constructor(private dash: Dash<App>, readonly flag: FlagModel) {
    this.model = this.dash.app.model

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.el.title = this.flag.label
    this.el.style.color = this.flag.color

    this.dash.listenTo<UpdateModelEvent>(this.model, "updateFlag").onData(data => {
      let flag = data.model as FlagModel
      if (flag.id === this.flag.id)
        this.el.style.color = flag.color
    })
  }
}