import { Model, ContributorModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"
import config from "../../../../isomorphic/config"

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
    let avatar = this.contributor.avatar
    this.el.title = this.contributor.name
    if (!avatar || avatar.variants.length === 0)
      this.el.textContent = this.contributor.login.charAt(0).toLocaleUpperCase()
    else
      this.el.style.backgroundImage = `url(${avatar.variants[0].url})`
  }
}
