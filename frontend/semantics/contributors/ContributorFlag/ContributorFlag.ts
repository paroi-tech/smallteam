import { Model, ContributorModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"
import { MediaModel } from "../../../AppModel/Models/MediaModel"
import { findClosestVariant } from "../../../libraries/mediaUtils"
import { MediaVariantModel } from "../../../AppModel/Models/MediaVariantModel";

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
    let variant: MediaVariantModel | undefined = undefined
    this.el.title = this.contributor.name
    if (!avatar || avatar.variants.length === 0 || (variant = this.findBestVariant(avatar)) === undefined)
      this.el.textContent = this.contributor.login.charAt(0).toLocaleUpperCase()
    else
      this.el.style.backgroundImage = `url(${variant.url})`
  }

  private findBestVariant(avatar: MediaModel) {
    return findClosestVariant(avatar, 48, 48)
  }
}
