import { Model, ContributorModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"
import { MediaModel } from "../../../AppModel/Models/MediaModel"
import { MediaVariantFragment } from "../../../../isomorphic/meta/MediaVariant"

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
      this.el.style.backgroundImage = `url(${this.findBestVariant(avatar).url})`
  }

  private findBestVariant(avatar: MediaModel) {
    let choice: MediaVariantFragment | undefined = undefined
    let minDistance = 10 ** 9
    for (let variant of avatar.variants.filter(v => v.imgWidth && v.imgHeight)) {
      let d = this.distanceFromIdealDim(variant.imgWidth!, variant.imgHeight!)
      if (d < minDistance) {
        choice = variant
        minDistance = d
      }
    }
    return choice || avatar.variants[0]
  }

  private distanceFromIdealDim(imgWidth: number, imgHeight: number) {
    return Math.abs(48 - imgWidth) ** 2 + Math.abs(48 - imgHeight)
  }
}
