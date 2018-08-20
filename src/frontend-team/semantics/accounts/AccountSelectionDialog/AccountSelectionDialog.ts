import { Dash } from "bkb"
import { Model, AccountModel } from "../../../AppModel/AppModel"
import CheckboxMultiSelect from "../../../generics/CheckboxMultiSelect/CheckboxMultiSelect"
import AccountBox from "../AccountBox/AccountBox"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"

const template = require("./AccountSelectionDialog.monk")

export default class AccountSelectionDialog {
  readonly el: HTMLDialogElement
  private buttonEl: HTMLButtonElement

  private model: Model
  private selector: CheckboxMultiSelect<AccountModel>

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    let view = render(template)
    this.el = view.rootEl()
    this.buttonEl = view.ref("button")
    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
    this.buttonEl.addEventListener("click", ev => {
      this.el.close()
      this.dash.emit("accountSelectionDialogClosed")
    })

    this.selector = this.createMultiSelect()
    view.ref("selectorContainer").appendChild(this.selector.el)
  }

  public show() {
    document.body.appendChild(this.el)
    this.el.showModal()
  }

  public selectAccounts(arr: AccountModel[]) {
    this.selector.selectItems(arr)
  }

  public selectedAccounts() {
    return this.selector.getSelected()
  }

  private createMultiSelect() {
    let ms = this.dash.create(
      CheckboxMultiSelect,
      "Accounts",
      (dash: Dash, account: AccountModel) => dash.create(AccountBox, account)
    ) as any

    let events = ["updateAccount", "createAccount", "deleteAccount"]
    this.dash.listenToModel(events, data => ms.setAllItems(this.model.global.steps))
    ms.setAllItems(this.model.global.accounts)

    return ms
  }
}
