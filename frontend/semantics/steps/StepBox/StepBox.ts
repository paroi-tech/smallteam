import { Dash } from "bkb"
import { render } from "monkberry"
import { Box } from "../../../generics/BoxList/BoxList"
import { StepModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import App from "../../../App/App"

const template = require("./StepBox.monk")

export default class StepBox implements Box {
  readonly el: HTMLElement
  private spanEl: HTMLElement

  private view: MonkberryView

  constructor(private dash: Dash<App>, readonly step: StepModel) {
    this.el = this.createView()
    this.listenToModel()
  }

  get id(): string {
    return this.step.id
  }

  public setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }

  private createView() {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement
    this.spanEl = el.querySelector(".js-span") as HTMLElement
    this.spanEl.textContent = this.step.label
    el.addEventListener("click", ev => this.dash.emit("stepBoxSelected", this.step))

    return el
  }

  private listenToModel() {
    this.dash.listenTo<UpdateModelEvent>(this.dash.app.model, "updateStep").onData(data => {
      if (data.model === this.step)
        this.spanEl.textContent = this.step.label
    })
  }
}
