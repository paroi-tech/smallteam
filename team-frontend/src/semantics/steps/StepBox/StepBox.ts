require("./_StepBox.scss")
import handledom from "handledom"
import { OwnDash } from "../../../App/OwnDash"
import { StepModel } from "../../../AppModel/AppModel"
import { Box } from "../../../generics/BoxList/BoxList"

const template = handledom`
<div class="LblSticker">
  <span class="LblSticker-lbl" h="span"></span>
  <button class="RightOpenBtn" type="button">▶</button>
</div>
`

export default class StepBox implements Box {
  readonly el: HTMLElement
  private spanEl: HTMLElement

  constructor(private dash: OwnDash, readonly step: StepModel) {
    const { root, ref } = template()
    this.el = root
    this.spanEl = ref("span")
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
