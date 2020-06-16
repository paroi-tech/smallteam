require("./_TaskFlag.scss")
import { render } from "@tomko/lt-monkberry"
import { OwnDash } from "../../../App/OwnDash"
import { FlagModel } from "../../../AppModel/AppModel"

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
