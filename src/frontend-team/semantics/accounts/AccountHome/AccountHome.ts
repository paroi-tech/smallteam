import AccountForm from "../AccountForm/AccountForm"
import PasswordForm from "../PasswordForm/PasswordForm"
import AvatarForm from "../AvatarForm/AvatarForm"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import { AccountModel } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash";
import { render } from "@fabtom/lt-monkberry";

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

  public activate(ctrl: ViewerController): void {
    ctrl.setTitle("Personal space").setContentEl(this.el)
  }

  public deactivate(): void {
  }
}
