import { Dash, Log } from "bkb"
import App from "../../../App/App"
import ContributorForm from "../ContributorForm/ContributorForm"
import PasswordForm from "../PasswordForm/PasswordForm"
import { render } from "monkberry"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import { Model, ContributorModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { ChildEasyRouter } from "../../../libraries/EasyRouter"

const template = require("./ContributorHome.monk")

export default class ContributorHome implements Workspace {
  readonly el: HTMLElement
  private formContainerEl: HTMLElement
  private passwordFormContainerEl: HTMLElement

  private view: MonkberryView

  public childRouter: ChildEasyRouter | undefined

  private form: ContributorForm
  private passwordForm: PasswordForm

  private model: Model
  private log: Log

  constructor(private dash: Dash<App>, private contributor: ContributorModel) {
    this.el = this.createView()

    this.form = this.dash.create(ContributorForm)
    this.passwordForm = this.dash.create(PasswordForm, this.contributor)

    this.formContainerEl.appendChild(this.form.el)
    this.form.setContributor(this.contributor)
    this.passwordFormContainerEl.appendChild(this.passwordForm.el)
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement
    this.formContainerEl = el.querySelector(".js-form-container") as HTMLElement
    this.passwordFormContainerEl = el.querySelector(".js-password-form-container") as HTMLElement

    return el
  }

  activate(ctrl: ViewerController): void {
    ctrl.setTitle("Personal space")
        .setContentEl(this.el)
  }

  deactivate(): void {

  }

}
