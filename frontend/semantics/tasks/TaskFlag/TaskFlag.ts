import { Dash } from "bkb"
import { Model, FlagModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"

const template = require("./TaskFlag.monk")

export default class TaskFlag {
  readonly el: HTMLElement

  constructor(private dash: OwnDash, readonly flag: FlagModel) {
    this.el = render(template).rootEl()
    this.el.title = this.flag.label
    this.el.style.backgroundColor = this.flag.color

    this.dash.listenToModel("updateFlag", data => {
      if (data.model === this.flag)
        this.el.style.color = this.flag.color
    })
  }
}
