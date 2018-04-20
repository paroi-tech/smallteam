import { Dash, Log } from "bkb"
import App from "../../../App/App"
import ContributorForm from "../ContributorForm/ContributorForm"
import PasswordForm from "../PasswordForm/PasswordForm"
import AvatarForm from "../AvatarForm/AvatarForm"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import { Model, ContributorModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { ChildEasyRouter } from "../../../libraries/EasyRouter"
import config from "../../../../isomorphic/config"
import { OwnDash } from "../../../App/OwnDash";
import { render } from "@fabtom/lt-monkberry";

const template = require("./ContributorHome.monk")

export default class ContributorHome implements Workspace {
  readonly el: HTMLElement

  constructor(private dash: OwnDash, private contributor: ContributorModel) {
    let view = render(template)
    this.el = view.rootEl()

    let form = this.dash.create(ContributorForm)
    form.setContributor(this.contributor)

    view.ref("formContainer").appendChild(form.el)
    view.ref("pwdArea").appendChild(this.dash.create(PasswordForm, this.contributor).el)
    view.ref("avatarArea").appendChild(this.dash.create(AvatarForm, contributor).el)
  }

  public activate(ctrl: ViewerController): void {
    ctrl.setTitle("Personal space").setContentEl(this.el)
  }

  public deactivate(): void {
  }
}
