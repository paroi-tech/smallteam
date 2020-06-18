require("./_TaskFlag.scss")
import handledom from "handledom"
import { OwnDash } from "../../../App/OwnDash"
import { FlagModel } from "../../../AppModel/AppModel"

const template = handledom`
<span class="TaskFlag WithTooltip" data-tooltip=""></span>
`

export default class TaskFlag {
  readonly el: HTMLElement

  constructor(private dash: OwnDash, readonly flag: FlagModel) {
    this.el = template().root
    this.el.dataset.tooltip = flag.label
    this.el.style.backgroundColor = flag.color

    this.dash.listenToModel("updateFlag", data => {
      if (data.model.id === this.flag.id) {
        this.el.style.color = this.flag.color
        this.el.dataset.tooltip = this.flag.label
      }
    })
  }
}
