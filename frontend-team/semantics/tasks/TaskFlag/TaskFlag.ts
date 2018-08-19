import { FlagModel } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"

const template = require("./TaskFlag.monk")

export default class TaskFlag {
  readonly el: HTMLElement

  constructor(private dash: OwnDash, readonly flag: FlagModel) {
    this.el = render(template).rootEl()
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
