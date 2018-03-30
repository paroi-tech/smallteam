import { Dash } from "bkb"
import { render } from "monkberry"
import App from "../../../App/App"
import { Box } from "../../../generics/BoxList/BoxList"
import { Model, ContributorModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash";

const template = require("./ContributorBox.monk")

export default class ContributorBox implements Box {
  readonly el: HTMLElement

  private model: Model
  private view: MonkberryView

  constructor(private dash: OwnDash, readonly contributor: ContributorModel) {
    this.model = this.dash.app.model

    this.view = render(template, document.createElement("div"))
    this.view.update(this.contributor)
    this.el = this.view.nodes[0] as HTMLElement
    this.el.onclick = ev => this.dash.emit("contributorBoxSelected", this.contributor)

    this.dash.listenToModel("updateContributor", data => {
      let contributor = data.model as ContributorModel
      if (contributor.id === this.contributor.id)
        this.view.update(this.contributor)
    })
  }

  get id(): string {
    return this.contributor.id
  }

  public setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }
}
