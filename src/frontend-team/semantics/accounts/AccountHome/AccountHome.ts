import { render } from "@fabtom/lt-monkberry"
import { OwnDash } from "../../../App/OwnDash"
import { AccountModel } from "../../../AppModel/AppModel"
import { ViewerController, Workspace } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import AccountForm from "../AccountForm/AccountForm"
import AvatarForm from "../AvatarForm/AvatarForm"
import PasswordForm from "../PasswordForm/PasswordForm"

const template = require("./AccountHome.monk")

export default class AccountHome implements Workspace {
  readonly el: HTMLElement

  constructor(private dash: OwnDash, private account: AccountModel) {
    let view = render(template)

    this.el = view.rootEl()

    let form = this.dash.create(AccountForm, false)
    form.setAccount(this.account)

    view.ref("formContainer").appendChild(form.el)
    view.ref("pwdArea").appendChild(this.dash.create(PasswordForm, this.account).el)
    view.ref("avatarArea").appendChild(this.dash.create(AvatarForm, account).el)
  }

  activate(ctrl: ViewerController): void {
    ctrl.setTitle("Personal space").setContentEl(this.el)
  }

  deactivate(): void {
  }
}
