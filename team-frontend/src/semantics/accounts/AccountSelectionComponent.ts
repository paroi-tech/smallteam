import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { AccountModel } from "../../AppModel/AppModel"
import MultiSelect, { MultiSelectOptions } from "../../generics/MultiSelect"
import AccountBox from "./AccountBox"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.AccountSelectionComponent {
  background-color: white;
  border: 1px solid gray;
  border-radius: 4px;
  margin: 100px auto;
  width: 300px;
}
`

const template = handledom`
<div class="AccountSelectionComponent">
  <div h="selector"></div>
</div>
`

export default class AccountSelectionComponent {
  readonly el: HTMLElement

  private selector: MultiSelect<AccountModel>

  constructor(dash: OwnDash) {
    const { root, ref } = template()
    this.el = root

    this.selector = dash.create<MultiSelect<AccountModel>, MultiSelectOptions<AccountModel>>(
      MultiSelect,
      {
        title: "Accounts",
        createItem: account => dash.create(AccountBox, account)
      }
    )

    const model = dash.app.model
    dash.listenToModel("changeAccount", () => this.selector.fillWith(model.global.accounts))
    this.selector.fillWith(model.global.accounts)

    ref("selector").appendChild(this.selector.el)
  }

  selectAccounts(arr: AccountModel[]) {
    this.selector.selectItems(arr)
  }

  selectedAccounts() {
    return this.selector.getSelected()
  }
}
