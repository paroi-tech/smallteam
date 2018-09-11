import { Dash } from "bkb"
import { Model, AccountModel } from "../../../AppModel/AppModel"
import CheckboxMultiSelect from "../../../generics/CheckboxMultiSelect/CheckboxMultiSelect"
import AccountBox from "../AccountBox/AccountBox"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"

const template = require("./AccountSelectionComponent.monk")

export default class AccountSelectionComponent {
  readonly el: HTMLElement

  private model: Model
  private selector: CheckboxMultiSelect<AccountModel>

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    let view = render(template)

    this.el = view.rootEl()
    this.selector = this.createMultiSelect()
    view.ref("selector").appendChild(this.selector.el)
  }

  selectAccounts(arr: AccountModel[]) {
    this.selector.selectItems(arr)
  }

  selectedAccounts() {
    return this.selector.getSelected()
  }

  private createMultiSelect() {
    let ms = this.dash.create(
      CheckboxMultiSelect,
      "Accounts",
      (dash: Dash, account: AccountModel) => dash.create(AccountBox, account)
    ) as any

    let events = ["updateAccount", "createAccount", "deleteAccount"]

    this.dash.listenToModel(events, () => ms.setAllItems(this.model.global.accounts))
    ms.setAllItems(this.model.global.accounts)

    return ms
  }
}
