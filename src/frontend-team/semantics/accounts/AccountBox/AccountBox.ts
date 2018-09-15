import { render } from "@fabtom/lt-monkberry"
import { OwnDash } from "../../../App/OwnDash"
import { AccountModel, Model } from "../../../AppModel/AppModel"
import { Box } from "../../../generics/BoxList/BoxList"
import AccountAvatar from "../AccountAvatar/AccountAvatar"

const template = require("./AccountBox.monk")

export default class AccountBox implements Box {
  readonly el: HTMLElement

  constructor(private dash: OwnDash, readonly account: AccountModel) {
    let view = render(template)

    view.update(this.account)
    this.el = view.rootEl()
    this.el.addEventListener("click", () => this.dash.emit("accountBoxSelected", this.account))

    let avatar = this.dash.create(AccountAvatar, {
      account: this.account,
      height: 16,
      width: 16
    })
    view.ref("avatar").appendChild(avatar.el)

    this.dash.listenToModel("updateAccount", data => {
      let account = data.model as AccountModel

      if (account.id === this.account.id)
        view.update(this.account)
    })
  }

  get id(): string {
    return this.account.id
  }

  setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }
}
