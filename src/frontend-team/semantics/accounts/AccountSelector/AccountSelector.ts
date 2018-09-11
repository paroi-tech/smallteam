import AccountBox from "../AccountBox/AccountBox"
import BoxList from "../../../generics/BoxList/BoxList"
import { Model, TaskModel, UpdateModelEvent, AccountModel } from "../../../AppModel/AppModel"
import AccountSelectionDialog from "../AccountSelectionDialog/AccountSelectionDialog"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"

import template = require("./AccountSelector.monk")
import itemTemplate = require("./label.monk")

/**
 * The idea of a list of checkbox was found here:
 * https://stackoverflow.com/questions/17714705/how-to-use-checkbox-inside-select-option
 */
export default class AccountSelector {
  readonly el: HTMLElement
  private boxList: BoxList<AccountBox>
  private dialog: AccountSelectionDialog

  private model: Model
  private task?: TaskModel

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    let view = render(template)
    this.el = view.rootEl()

    view.ref("btn").addEventListener("click", ev => {
      if (!this.task)
        return
      this.dialog.selectAccounts(this.task.affectedTo || [])
      document.body.appendChild(this.dialog.el)
      this.dialog.show()
    })

    this.boxList = this.dash.create(BoxList, {
      id: "",
      name: "Affected accounts",
      group: undefined,
      sort: true,
      inline: true
    })
    view.ref("boxlist").appendChild(this.boxList.el)

    this.dialog = this.dash.create(AccountSelectionDialog)
    this.dash.listenTo(this.dialog, "accountSelectionDialogClosed", () => {
      let arr = this.dialog.selectedAccounts()
      this.boxList.clear()
      arr.forEach(c => this.addBoxFor(c))
    })

    this.dash.listenToModel("deleteAccount", data => {
      let accountId = data.id as string
      this.boxList.removeBox(accountId)
    })
  }

  refresh() {
    this.boxList.clear()
    if (!this.task || !this.task.affectedTo)
      return
    for (let c of this.task.affectedTo)
      this.addBoxFor(c)
  }

  // --
  // -- Accessors
  // --

  getTask() {
    return this.task
  }

  setTask(task?: TaskModel) {
    this.task = undefined
    this.boxList.clear()
    this.task = task
    if (!task || !task.affectedToIds)
      return
    task.affectedToIds.forEach(id => {
      let account = this.model.global.accounts.get(id)
      if (account)
        this.addBoxFor(account)
    })
  }

  get selectedAccountIds(): string[] {
    return this.task ? this.boxList.getOrder() : []
  }

  // --
  // -- Utilities
  // --

  private addBoxFor(account: AccountModel) {
    let box = this.dash.create(AccountBox, account)
    this.boxList.addBox(box)
  }
}
