import { Box } from "../../../generics/BoxList/BoxList"
import { Model, AccountModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"
import AccountFlag from "../AccountFlag/AccountFlag"

const template = require("./AccountBox.monk")

export default class AccountBox implements Box {
  readonly el: HTMLElement

  private model: Model

  constructor(private dash: OwnDash, readonly account: AccountModel) {
    this.model = this.dash.app.model

    let view = render(template)
    view.update(this.account)
    this.el = view.rootEl()
    this.el.addEventListener("click", ev => this.dash.emit("accountBoxSelected", this.account))

    let flag = this.dash.create(AccountFlag, this.account)
    view.ref("avatar").appendChild(flag.el)

    this.dash.listenToModel("updateAccount", data => {
      let account = data.model as AccountModel
      if (account.id === this.account.id)
        view.update(this.account)
    })
  }

  get id(): string {
    return this.account.id
  }

  public setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }
}
