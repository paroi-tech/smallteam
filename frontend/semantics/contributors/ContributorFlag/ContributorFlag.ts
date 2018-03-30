import { Dash } from "bkb"
import { render } from "monkberry"
import App from "../../../App/App"
import { Model, ContributorModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash";

const template = require("./ContributorFlag.monk")

export default class ContributorFlag {
  readonly el: HTMLElement

  private view: MonkberryView
  private model: Model

  constructor(private dash: OwnDash, readonly contributor: ContributorModel) {
    this.model = this.dash.app.model

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement

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
