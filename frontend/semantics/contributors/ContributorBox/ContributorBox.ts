import { Dash } from "bkb"
import App from "../../../App/App"
import { Box } from "../../../generics/BoxList/BoxList"
import { Model, ContributorModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash";
import { render } from "../../../libraries/lt-monkberry";

const template = require("./ContributorBox.monk")

export default class ContributorBox implements Box {
  readonly el: HTMLElement

  private model: Model

  constructor(private dash: OwnDash, readonly contributor: ContributorModel) {
    this.model = this.dash.app.model

    let view = render(template)
    view.update(this.contributor)
    this.el = view.rootEl()
    this.el.addEventListener("click", ev => this.dash.emit("contributorBoxSelected", this.contributor))

    this.dash.listenToModel("updateContributor", data => {
      let contributor = data.model as ContributorModel
      if (contributor.id === this.contributor.id)
        view.update(this.contributor)
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
