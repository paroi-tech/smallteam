import { Model, AccountModel } from "../../../AppModel/AppModel"
import { CheckboxMultiSelect, CheckboxMultiSelectOptions } from "../../../generics/CheckboxMultiSelect/CheckboxMultiSelect"
import AccountBox from "../AccountBox/AccountBox"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"
import App from "../../../App/App"

import template = require("./AccountSelectionComponent.monk")

export default class AccountSelectionComponent {
  readonly el: HTMLElement

  private model: Model
  private selector: CheckboxMultiSelect<AccountModel, OwnDash>

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    let view = render(template)
    this.el = view.rootEl()

    this.selector = this.dash.create<CheckboxMultiSelect<AccountModel, OwnDash>, CheckboxMultiSelectOptions<AccountModel>, OwnDash>(
      CheckboxMultiSelect,
      {
        title: "Accounts",
        createItem: (dash, account) => dash.create(AccountBox, account)
      }
    )

    this.dash.listenToModel("changeAccount", () => this.selector.fillWith(this.model.global.accounts))
    this.selector.fillWith(this.model.global.accounts)

    view.ref("selector").appendChild(this.selector.el)
  }

  selectAccounts(arr: AccountModel[]) {
    this.selector.selectItems(arr)
  }

  selectedAccounts() {
    return this.selector.getSelected()
  }
}
