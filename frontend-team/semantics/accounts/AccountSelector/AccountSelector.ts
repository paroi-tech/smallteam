import AccountBox from "../AccountBox/AccountBox"
import BoxList from "../../../generics/BoxList/BoxList"
import { Model, TaskModel, UpdateModelEvent, AccountModel } from "../../../AppModel/AppModel"
import AccountSelectionDialog from "../AccountSelectionDialog/AccountSelectionDialog"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"

const template = require("./AccountSelector.monk")
const itemTemplate = require("./label.monk")

/**
 * The idea of a list of checkbox was found here:
 * https://stackoverflow.com/questions/17714705/how-to-use-checkbox-inside-select-option
 */
export default class AccountSelector {
  readonly el: HTMLElement
  private boxList: BoxList<AccountBox>
  private dialog: AccountSelectionDialog

  private model: Model
  private currentTask: TaskModel | undefined

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    let view = render(template)
    this.el = view.rootEl()

    view.ref("btn").addEventListener("click", ev => {
      if (!this.currentTask)
        return
      this.dialog.selectAccounts(this.currentTask.affectedTo || [])
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

  public reset() {
    this.currentTask = undefined
    this.boxList.clear()
  }

  public refresh() {
    this.boxList.clear()
    if (!this.currentTask || !this.currentTask.affectedTo)
      return
    for (let c of this.currentTask.affectedTo)
      this.addBoxFor(c)
  }

  // --
  // -- Accessors
  // --

  get task(): TaskModel | undefined {
    return this.currentTask
  }

  set task(task: TaskModel | undefined) {
    this.reset()
    this.currentTask = task
    if (!task || !task.affectedToIds)
      return
    task.affectedToIds.forEach(id => {
      let account = this.model.global.accounts.get(id)
      if (account)
        this.addBoxFor(account)
    })
  }

  get selectedAccountIds(): string[] {
    return this.currentTask ? this.boxList.getOrder() : []
  }

  // --
  // -- Utilities
  // --

  private addBoxFor(account: AccountModel) {
    let box = this.dash.create(AccountBox, account)
    this.boxList.addBox(box)
  }
}
