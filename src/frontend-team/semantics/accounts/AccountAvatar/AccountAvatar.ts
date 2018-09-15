import { render } from "@fabtom/lt-monkberry"
import { removeAllChildren } from "../../../../sharedFrontend/libraries/utils"
import { OwnDash } from "../../../App/OwnDash"
import { AccountModel } from "../../../AppModel/AppModel"
import { MediaModel } from "../../../AppModel/Models/MediaModel"
import { closestImageVariant } from "../../../libraries/mediaUtils"

const template = require("./AccountAvatar.monk")

export interface AccountAvatarOptions {
  account: AccountModel
  width?: number
  height?: number
}

export default class AccountAvatar {
  readonly el: HTMLElement

  private options: Required<AccountAvatarOptions>

  constructor(private dash: OwnDash, options: AccountAvatarOptions) {
    this.options = {
      account: options.account,
      width: options.width || 48,
      height: options.height || 48
    }

    this.el = render(template).rootEl()

    this.el.style.width = `${this.options.width}px`
    this.el.style.height = `${this.options.height}px`
    this.update()

    this.dash.listenToModel("updateAccount", data => {
      let account = data.model as AccountModel
      if (account.id === this.options.account.id)
        this.update()
    })
  }

  private update() {
    let avatar = this.options.account.avatar
    let variant = avatar ? this.findBestVariant(avatar) : undefined

    this.el.style.backgroundImage = null
    removeAllChildren(this.el)
    this.el.title = this.options.account.name
    if (!variant)
      this.el.textContent = this.options.account.login.charAt(0).toLocaleUpperCase()
    else
      this.el.style.backgroundImage = `url(${variant.url})`
  }

  private findBestVariant(avatar: MediaModel) {
    return closestImageVariant(avatar, this.options.width, this.options.height)
  }
}
