import { Log } from "bkb"
import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { AccountModel, Model } from "../../AppModel/AppModel"
import BoxList from "../../generics/BoxList"
import { DropdownMenu } from "../../generics/DropdownMenu"
import { createCustomMenuBtnEl } from "../../generics/workspaceUtils"
import { ViewerController, Workspace } from "../../generics/WorkspaceViewer"
import { ChildEasyRouter, createChildEasyRouter } from "../../libraries/EasyRouter"
import AccountBox from "./AccountBox"
import AccountForm from "./AccountForm"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.AccountWorkspace {
  display: flex;
  flex-direction: row;
}
`

const template = handledom`
<section class="AccountWorkspace">
  <div h="list"></div>
  <div h="form"></div>
</section>
`

export default class AccountWorkspace implements Workspace {
  readonly el: HTMLElement

  readonly childRouter: ChildEasyRouter

  private boxList: BoxList<AccountBox>
  private form: AccountForm
  private menu: DropdownMenu

  private model: Model
  private log: Log

  private accounts: Map<string, AccountModel> = new Map()
  private boxes: Map<string, AccountBox> = new Map()

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    const { root, ref } = template()

    this.el = root
    this.form = this.dash.create(AccountForm)
    ref("form").appendChild(this.form.el)
    this.boxList = this.dash.create(BoxList, {
      id: "accountBoxList",
      title: "Accounts",
      sort: false
    })
    ref("list").appendChild(this.boxList.el)
    this.menu = this.dash.create(DropdownMenu, {
      btnEl: createCustomMenuBtnEl() as HTMLElement,
      align: "left"
    })
    this.menu.entries.createNavBtn({
      label: "Add account",
      onClick: () => this.form.reset()
    })

    this.dash.listenToModel("createAccount", data => {
      const account = data.model as AccountModel
      const box = this.createBoxFor(account)

      this.accounts.set(account.id, account)
      this.boxList.addBox(box)
    })
    this.dash.listenTo<AccountModel>("accountBoxSelected", data => {
      this.form.setAccount(data)
    })

    this.fillBoxList()

    this.childRouter = createChildEasyRouter()
    this.childRouter.addAsyncErrorListener(err => this.log.error(err))
    this.childRouter.map({
      route: "my-profile",
      activate: () => {
        this.form.setAccount(this.model.session.account)
      },
      title: "My Profile"
    })
  }

  activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el)
      .setTitleRightEl(this.menu.btnEl)
      .setTitle("Accounts")
  }

  private fillBoxList() {
    this.model.global.accounts.forEach(c => {
      const box = this.createBoxFor(c)

      this.accounts.set(c.id, c)
      this.boxList.addBox(box)
    })
  }

  private createBoxFor(account: AccountModel): AccountBox {
    const box = this.dash.create(AccountBox, account)
    this.boxes.set(account.id, box)

    return box
  }
}
