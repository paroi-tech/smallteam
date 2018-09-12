import { Model, AccountModel } from "../../../AppModel/AppModel"
import { MultiSelect, MultiSelectOptions } from "../../../generics/MultiSelect/MultiSelect"
import AccountBox from "../AccountBox/AccountBox"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"
import App from "../../../App/App"

const template = require("./AccountSelectionComponent.monk")

export default class AccountSelectionComponent {
  readonly el: HTMLElement

  private model: Model
  private selector: MultiSelect<AccountModel, OwnDash>

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    let view = render(template)
    this.el = view.rootEl()

    this.selector = this.dash.create<MultiSelect<AccountModel, OwnDash>, MultiSelectOptions<AccountModel>, OwnDash>(
      MultiSelect,
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
