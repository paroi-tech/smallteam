import { Dash, Bkb } from "bkb"
import { render } from "monkberry"
import App from "../../../App/App";
import { Box } from "../../../generics/BoxList/BoxList";
import { Model, ContributorModel, UpdateModelEvent } from "../../../AppModel/AppModel";

const template = require("./ContributorBox.monk")

export default class ContributorBox implements Box {
  readonly el: HTMLElement
  readonly id: string

  private model: Model
  private view: MonkberryView

  constructor(private dash: Dash<App>, readonly contributor: ContributorModel) {
    this.model = this.dash.app.model
    this.id = contributor.id

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.view.update(this.contributor)

    this.listenToModel()
    this.el.onclick = ev => this.dash.emit("contributorBoxSelected", this.contributor)
  }

  private listenToModel() {
    this.dash.listenTo<UpdateModelEvent>(this.model, "updateContributor").onData(data => {
      let contributor = data.model as ContributorModel
      if (contributor.id === this.contributor.id)
        this.view.update(this.contributor)
    })
  }

  public setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }
}
