import { OwnDash } from "../../../App/OwnDash"
import { Log } from "bkb"
import { ProjectModel, Model } from "../../../AppModel/AppModel"
import { render } from "@fabtom/lt-monkberry"

const template = require("./ArchivedTaskBoard.monk")

export default class ArchivedTaskBoard {
  readonly el: HTMLElement

  private model: Model
  private log: Log

  constructor(private dash: OwnDash, readonly project: ProjectModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.el = render(template).rootEl()
  }
}
