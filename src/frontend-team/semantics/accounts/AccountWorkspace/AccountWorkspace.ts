import App from "../../../App/App"
import { Dash, Log } from "bkb"
import AccountBox from "../AccountBox/AccountBox"
import AccountForm from "../AccountForm/AccountForm"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import { createCustomMenuBtnEl } from "../../../generics/WorkspaceViewer/workspaceUtils"
import BoxList from "../../../generics/BoxList/BoxList"
import { DropdownMenu, DropdownMenuOptions } from "../../../generics/DropdownMenu/DropdownMenu"
import { Model, AccountModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { ChildEasyRouter, createChildEasyRouter, ERQuery } from "../../../libraries/EasyRouter"
import { OwnDash } from "../../../App/OwnDash";
import { render } from "@fabtom/lt-monkberry";

const template = require("./AccountWorkspace.monk")

export default class AccountWorkspace implements Workspace {
  readonly el: HTMLElement

  private boxList: BoxList<AccountBox>
  private form: AccountForm
  private menu: DropdownMenu

  private model: Model
  private log: Log

  private accounts: Map<string, AccountModel> = new Map()
  private boxes: Map<string, AccountBox> = new Map()

  readonly childRouter: ChildEasyRouter

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    let view = render(template)
    this.el = view.rootEl()

    this.form = this.dash.create(AccountForm)
    view.ref("form").appendChild(this.form.el)
    this.boxList = this.dash.create(BoxList, {
      id: "accountBoxList",
      name: "Accounts",
      sort: false
    })
    view.ref("list").appendChild(this.boxList.el)
    this.menu = this.dash.create(DropdownMenu, {
      btnEl: createCustomMenuBtnEl()
    })
    this.menu.entries.createNavBtn({
      label: "Add account",
      onClick: () => this.form.reset()
    })

    this.dash.listenToModel("createAccount", data => {
      let account = data.model as AccountModel
      let box = this.createBoxFor(account)

      this.accounts.set(account.id, account)
      this.boxList.addBox(box)
    })
    this.dash.listenTo<AccountModel>("accountBoxSelected", data => {
      this.form.setAccount(data)
    })

    this.fillBoxList()

    this.childRouter = createChildEasyRouter()
    this.childRouter.addAsyncErrorListener(this.log.info)
    this.childRouter.map({
      route: "my-profile",
      activate: (query: ERQuery) => {
        this.form.setAccount(this.model.session.account)
      },
      title: "My Profile"
    })
  }

  public activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el)
      .setTitleRightEl(this.menu.btnEl)
      .setTitle("Accounts")
  }

  public deactivate() {
  }

  private fillBoxList() {
    this.model.global.accounts.forEach(c => {
      let box = this.createBoxFor(c)

      this.accounts.set(c.id, c)
      this.boxList.addBox(box)
    })
  }

  private createBoxFor(account: AccountModel): AccountBox {
    let box = this.dash.create(AccountBox, account)
    this.boxes.set(account.id, box)

    return box
  }
}
