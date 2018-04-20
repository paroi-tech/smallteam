import { Dash } from "bkb"
import App from "../../../App/App"
import { Model, ContributorModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash";
import { render } from "@fabtom/lt-monkberry";

const template = require("./ContributorFlag.monk")

export default class ContributorFlag {
  readonly el: HTMLElement

  private model: Model

  constructor(private dash: OwnDash, readonly contributor: ContributorModel) {
    this.model = this.dash.app.model

    this.el = render(template).rootEl()

    this.update()

    this.dash.listenToModel("updateContributor", data => {
      let contributor = data.model as ContributorModel
      if (contributor.id === this.contributor.id)
        this.update()
    })
  }

  private update() {
    this.el.textContent = this.contributor.login.charAt(0).toLocaleUpperCase()
    this.el.title = this.contributor.name
  }
}
