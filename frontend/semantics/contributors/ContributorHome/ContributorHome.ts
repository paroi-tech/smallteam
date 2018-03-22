import { Dash, Log } from "bkb"
import App from "../../../App/App"
import ContributorForm from "../ContributorForm/ContributorForm"
import PasswordForm from "../PasswordForm/PasswordForm"
import AvatarForm from "../AvatarForm/AvatarForm"
import { render } from "monkberry"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import { Model, ContributorModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { ChildEasyRouter } from "../../../libraries/EasyRouter"
import config from "../../../../isomorphic/config"

const template = require("./ContributorHome.monk")

export default class ContributorHome implements Workspace {
  readonly el: HTMLElement
  private formContainerEl: HTMLElement
  private passwdFormContainerEl: HTMLElement
  private avatarFormContainer: HTMLElement

  private view: MonkberryView

  public childRouter: ChildEasyRouter | undefined

  private form: ContributorForm
  private passwordForm: PasswordForm
  private avatarForm: AvatarForm

  private model: Model
  private log: Log

  constructor(private dash: Dash<App>, private contributor: ContributorModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.formContainerEl = this.el.querySelector(".js-form-container") as HTMLElement
    this.passwdFormContainerEl = this.el.querySelector(".js-password-form-container") as HTMLElement
    this.avatarFormContainer = this.el.querySelector(".js-avatar-form-container") as HTMLElement

    this.form = this.dash.create(ContributorForm)
    this.passwordForm = this.dash.create(PasswordForm, this.contributor)
    this.avatarForm = this.dash.create(AvatarForm, contributor)

    this.formContainerEl.appendChild(this.form.el)
    this.form.contributor = this.contributor
    this.passwdFormContainerEl.appendChild(this.passwordForm.el)
    this.avatarFormContainer.appendChild(this.avatarForm.el)
  }

  public activate(ctrl: ViewerController): void {
    ctrl.setTitle("Personal space").setContentEl(this.el)
  }

  public deactivate(): void {

  }
}
