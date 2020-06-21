import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { AccountModel } from "../../AppModel/AppModel"
import { Box } from "../../generics/BoxList"
import AccountAvatar from "./AccountAvatar"

const template = handledom`
<div class="AccountBox">
  <span h="avatar"></span>
  <span class="AccountBox-name">{{ name }}</span>
</div>
`

export default class AccountBox implements Box {
  readonly el: HTMLElement

  constructor(private dash: OwnDash, readonly account: AccountModel) {
    const { root, ref, update } = template()

    update(this.account)
    this.el = root
    this.el.addEventListener("click", () => this.dash.emit("accountBoxSelected", this.account))

    let avatar = this.dash.create(AccountAvatar, {
      account: this.account,
      height: 16,
      width: 16
    })
    ref("avatar").appendChild(avatar.el)

    this.dash.listenToModel("updateAccount", data => {
      let account = data.model as AccountModel

      if (account.id === this.account.id)
        update(this.account)
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
