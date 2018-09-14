import { render } from "@fabtom/lt-monkberry"
import { OwnDash } from "../../../App/OwnDash"
import { AccountModel, Model, TaskModel } from "../../../AppModel/AppModel"
import BoxList from "../../../generics/BoxList/BoxList"
import { Dialog, DialogOptions } from "../../../generics/Dialog/Dialog"
import AccountBox from "../AccountBox/AccountBox"
import AccountSelectionComponent from "../AccountSelectionComponent/AccountSelectionComponent"

const template = require("./AccountSelector.monk")
// const itemTemplate = require("./label.monk")

/**
 * The idea of a list of checkbox was found here:
 * https://stackoverflow.com/questions/17714705/how-to-use-checkbox-inside-select-option
 */
export default class AccountSelector {
  readonly el: HTMLElement
  private boxList: BoxList<AccountBox>
  private dialog: Dialog<AccountSelectionComponent>

  private model: Model
  private task?: TaskModel

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    let view = render(template)
    this.el = view.rootEl()

    view.ref("btn").addEventListener("click", async () => {
      if (!this.task)
        return
      this.dialog.content.selectAccounts(this.task.affectedTo || [])
      await this.dialog.open()
      this.boxList.clear()
      this.dialog.content.selectedAccounts().forEach(c => this.addBoxFor(c))
    })

    this.boxList = this.dash.create(BoxList, {
      sort: true,
      inline: true,
      noHeader: true
    })
    view.ref("boxlist").appendChild(this.boxList.el)

    this.dialog = this.dash.create<Dialog<AccountSelectionComponent>, DialogOptions<AccountSelectionComponent>>(Dialog, {
      content: this.dash.create(AccountSelectionComponent),
      title: "Select Accounts"
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
