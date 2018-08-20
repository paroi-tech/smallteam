import { Model, AccountModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"
import { MediaModel } from "../../../AppModel/Models/MediaModel"
import { closestImageVariant } from "../../../libraries/mediaUtils"
import { MediaVariantModel } from "../../../AppModel/Models/MediaVariantModel";

const template = require("./AccountFlag.monk")

export default class AccountFlag {
  readonly el: HTMLElement

  private model: Model

  constructor(private dash: OwnDash, readonly account: AccountModel) {
    this.model = this.dash.app.model
    this.el = render(template).rootEl()
    this.update()
    this.dash.listenToModel("updateAccount", data => {
      let account = data.model as AccountModel
      if (account.id === this.account.id)
        this.update()
    })
  }

  private update() {
    let avatar = this.account.avatar
    let variant: MediaVariantModel | undefined = undefined
    this.el.title = this.account.name
    if (!avatar || avatar.variants.length === 0 || (variant = this.findBestVariant(avatar)) === undefined)
      this.el.textContent = this.account.login.charAt(0).toLocaleUpperCase()
    else
      this.el.style.backgroundImage = `url(${variant.url})`
  }

  private findBestVariant(avatar: MediaModel) {
    return closestImageVariant(avatar, 48, 48)
  }
}
