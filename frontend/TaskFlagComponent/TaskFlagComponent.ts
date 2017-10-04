import App from "../App/App"
import { Dash, Bkb } from "bkb"
import { Model, FlagModel } from "../AppModel/AppModel"
import { render } from "monkberry"

import * as template from "./taskflagcomponent.monk"

export default class TaskFlagComponent {
  readonly el: HTMLElement

  private view: MonkberryView

  constructor(private dash: Dash<App>, readonly flag: FlagModel) {
    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.el.title = this.flag.label
    this.el.style.backgroundColor = this.flag.color
  }
}
