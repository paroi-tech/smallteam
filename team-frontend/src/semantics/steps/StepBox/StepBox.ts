require("./_StepBox.scss")
import { render } from "@tomko/lt-monkberry"
import { OwnDash } from "../../../App/OwnDash"
import { StepModel } from "../../../AppModel/AppModel"
import { Box } from "../../../generics/BoxList/BoxList"

const template = require("./StepBox.monk")

export default class StepBox implements Box {
  readonly el: HTMLElement
  private spanEl: HTMLElement

  constructor(private dash: OwnDash, readonly step: StepModel) {
    let view = render(template)
    this.el = view.rootEl()
    this.spanEl = view.ref("span")
    this.spanEl.textContent = this.step.label
    this.el.addEventListener("click", () => this.dash.emit("stepBoxSelected", this.step))

    this.dash.listenToModel("updateStep", data => {
      if (data.model === this.step)
        this.spanEl.textContent = this.step.label
    })
  }

  get id(): string {
    return this.step.id
  }

  setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }
}
