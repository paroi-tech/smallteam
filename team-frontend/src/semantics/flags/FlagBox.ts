import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { FlagModel } from "../../AppModel/AppModel"
import { Box } from "../../generics/BoxList"

const template = handledom`
<div class="FlagBox">
  <span class="FlagBox-span">{{ label }}</span>
  &nbsp;
  <span class="fa fa-circle fa-1x" h="boxColor"></span>
</div>
`

export default class FlagBox implements Box {
  readonly el: HTMLElement

  constructor(private dash: OwnDash, readonly flag: FlagModel) {
    const { root, ref, update } = template()
    const colorEl = ref<HTMLElement>("boxColor")

    this.el = root
    colorEl.style.color = this.flag.color
    this.el.addEventListener("click", () => this.dash.emit("flagBoxSelected", this.flag))
    update(this.flag)

    this.dash.listenToModel("updateFlag", data => {
      const flag = data.model as FlagModel

      if (flag.id === this.flag.id) {
        update(this.flag)
        colorEl.style.color = this.flag.color
      }
    })
  }

  setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }

  get id(): string {
    return this.flag.id
  }
}
