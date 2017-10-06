import App from "../App/App"
import { Dash, Bkb } from "bkb"
import { Model, ContributorModel } from "../AppModel/AppModel"
import { UpdateModelEvent } from "../AppModel/ModelEngine"
import { render } from "monkberry"

import * as template from "./contributorflag.monk"

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
    this.contentEl.textContent = this.contributor.login.charAt(0).toLocaleUpperCase()
    this.el.title = this.contributor.name

    this.dash.listenTo<UpdateModelEvent>(this.model, "updateContributor").onData(data => {
      let contributor = data.model as ContributorModel
      if (contributor.id === this.contributor.id) {
        // TODO: Update contributor flag
      }
    })
  }
}
