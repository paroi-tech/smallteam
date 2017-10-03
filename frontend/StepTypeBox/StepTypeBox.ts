import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Box } from "../BoxList/BoxList"
import { StepTypeModel } from "../AppModel/AppModel"
import { UpdateModelEvent } from "../AppModel/ModelEngine"
import { render } from "monkberry"

import * as template from "./steptypebox.monk"

/**
 * Component used to show basic information about a StepType object.
 *
 * A StepTypeBox emits (through the dash) a `stepTypeBoxSelected` event when a user click on it.
 * The event provides the `StepType` that the box represents.
 */
export default class StepTypeBox implements Box {
  readonly el: HTMLElement

  private spanEl: HTMLElement

  public readonly id: string

  private view: MonkberryView

  constructor(private dash: Dash<App>, readonly stepType: StepTypeModel) {
    let $container = $(template)

    this.id = this.stepType.id

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.spanEl = this.el.querySelector(".js-span") as HTMLElement
    this.spanEl.textContent = this.stepType.name
    this.el.addEventListener("click", ev => this.dash.emit("stepTypeBoxSelected", this.stepType))

    this.dash.listenTo<UpdateModelEvent>(this.dash.app.model, "updateStepType").onData(data => {
      if (data.model === this.stepType)
        this.spanEl.textContent = this.stepType.name
    })
  }

  /**
   * Add or remove focus from the box.
   */
  public setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }
}
