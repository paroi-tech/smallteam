import { Model, AccountModel } from "../../../AppModel/AppModel"
import { CheckboxMultiSelect } from "../../../generics/CheckboxMultiSelect/CheckboxMultiSelect"
import AccountBox from "../AccountBox/AccountBox"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"

import template = require("./AccountSelectionDialog.monk")
import App from "../../../App/App"

export default class AccountSelectionDialog {
  readonly el: HTMLDialogElement
  private buttonEl: HTMLButtonElement

  private model: Model
  private selector: CheckboxMultiSelect<AccountModel, App>

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    let view = render(template)

    this.el = view.rootEl()
    this.buttonEl = view.ref("button")

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())

    this.buttonEl.addEventListener("click", () => {
      this.el.close()
      this.dash.emit("accountSelectionDialogClosed")
    })

    this.selector = this.dash.create<CheckboxMultiSelect<AccountModel, App>>(
      CheckboxMultiSelect,
      {
        title: "Accounts",
        createItem: (dash: OwnDash, account: AccountModel) => dash.create(AccountBox, account)
      }
    )

    this.dash.listenToModel("changeAccount", () => this.selector.fillWith(this.model.global.accounts))
    this.selector.fillWith(this.model.global.accounts)

    view.ref("selectorContainer").appendChild(this.selector.el)
  }

  show() {
    document.body.appendChild(this.el)
    this.el.showModal()
  }

  selectAccounts(arr: AccountModel[]) {
    this.selector.selectItems(arr)
  }

  selectedAccounts() {
    return this.selector.getSelected()
  }
}
