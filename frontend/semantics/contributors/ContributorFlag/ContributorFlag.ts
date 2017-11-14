import { Dash } from "bkb"
import { render } from "monkberry"
import App from "../../../App/App"
import { Model, ContributorModel, UpdateModelEvent } from "../../../AppModel/AppModel"

const template = require("./ContributorFlag.monk")

export default class ContributorFlag {
  readonly el: HTMLElement
  private contentEl: HTMLElement

  private view: MonkberryView

  private model: Model

  constructor(private dash: Dash<App>, readonly contributor: ContributorModel) {
    this.model = this.dash.app.model

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.contentEl = this.el.querySelector(".js-content") as HTMLElement
    this.update()

    this.dash.listenTo<UpdateModelEvent>(this.model, "updateContributor").onData(data => {
      let contributor = data.model as ContributorModel
      if (contributor.id === this.contributor.id)
        this.update()
    })
  }

  private update() {
    this.contentEl.textContent = this.contributor.login.charAt(0).toLocaleUpperCase()
    this.el.title = this.contributor.name
  }
}
