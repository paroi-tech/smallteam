import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Box } from "../BoxList/BoxList"
import { Model, ContributorModel } from "../AppModel/AppModel"

export default class ContributorBox implements Box {
  readonly el: HTMLElement
  private spanEl: HTMLElement

  public readonly id: string

  private model: Model

  constructor(private dash: Dash<App>, readonly contributor: ContributorModel) {
    this.id = this.contributor.id
    this.model = this.dash.app.model
    this.el = document.createElement("div")
    this.el.classList.add("ContributorBox")
    this.spanEl = document.createElement("span")
    this.spanEl.textContent = this.contributor.name
    this.el.appendChild(this.spanEl)
    this.listenToModel()
    this.el.onclick = (ev) => {
      this.dash.emit("contributorBoxSelected", this.contributor)
    }
  }

  private listenToModel() {
    this.model.on("change", "dataFirst", data => {
      if (data.type !== "Contributor" || data.cmd !== "update")
        return
      let contributor = data.model as ContributorModel
      if (contributor.id === this.contributor.id)
        this.spanEl.textContent = this.contributor.name
    })
  }

  public setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }
}
