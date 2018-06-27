import { OwnDash } from "../../../App/OwnDash"
import { Log } from "bkb"
import { ProjectModel, Model } from "../../../AppModel/AppModel"
import { render } from "@fabtom/lt-monkberry"

const template = require("./OnHoldTaskBoard.monk")

export default class OnHoldTaskBoard {
  readonly el: HTMLElement

  private model: Model
  private log: Log

  constructor(private dash: OwnDash, readonly project: ProjectModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.el = render(template).rootEl()
  }
}
