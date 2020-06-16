require("./_AccountSelectionComponent.scss")
import { render } from "@tomko/lt-monkberry"
import { OwnDash } from "../../../App/OwnDash"
import { AccountModel } from "../../../AppModel/AppModel"
import MultiSelect, { MultiSelectOptions } from "../../../generics/MultiSelect"
import AccountBox from "../AccountBox/AccountBox"

const template = require("./AccountSelectionComponent.monk")

export default class AccountSelectionComponent {
  readonly el: HTMLElement

  private selector: MultiSelect<AccountModel>

  constructor(dash: OwnDash) {
    let view = render(template)
    this.el = view.rootEl()

    this.selector = dash.create<MultiSelect<AccountModel>, MultiSelectOptions<AccountModel>>(
      MultiSelect,
      {
        title: "Accounts",
        createItem: account => dash.create(AccountBox, account)
      }
    )

    let model = dash.app.model
    dash.listenToModel("changeAccount", () => this.selector.fillWith(model.global.accounts))
    this.selector.fillWith(model.global.accounts)

    view.ref("selector").appendChild(this.selector.el)
  }

  selectAccounts(arr: AccountModel[]) {
    this.selector.selectItems(arr)
  }

  selectedAccounts() {
    return this.selector.getSelected()
  }
}
