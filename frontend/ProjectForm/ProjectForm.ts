import App from "../App/App"
import { Bkb, Dash } from "bkb"
import { Model, ProjectModel } from "../AppModel/AppModel"
import StepSelector from "./StepSelector/StepSelector"
import { Workspace, ViewerController } from "../WorkspaceViewer/WorkspaceViewer"
import { render } from "monkberry"
import directives from "monkberry-directives"
import * as template from "./projectform.monk"

/**
 * Component that enables to create and edit project setings.
 */
export default class ProjectForm implements Workspace {
  readonly el: HTMLElement

  private codeEl: HTMLInputElement
  private nameEl: HTMLInputElement
  private descriptionEl: HTMLTextAreaElement
  private submitSpinnerEl: HTMLElement

  private view: MonkberryView
  private stepSelector: StepSelector

  private state = {
    name: "",
    code: "",
    // Monkberry does not work well with TextAreaElement, so we update manually
    // the content of the description field.
    ctrl: {
      submit: () => this.onSubmit().catch(console.log)
    }
  }

  private model: Model
  private project: ProjectModel | undefined

  /**
   * The project code is automatically generated from the project name.
   * But the user has the ability to give a custom code. So when the user types in the
   * project code field, we use this flag to stop the generation of the project code.
   */
  private generateCode = true

  /**
   * Create a new project form.
   */
  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createHtmlElements()
    this.listenToForm()
    this.createChildComponents()
  }

  /**
   * Create ProjectForm elements from template.
   */
  private createHtmlElements() {
    let wrapperEl = document.createElement("div")

    wrapperEl.classList.add("ProjectForm")
    this.view = render(template, wrapperEl, { directives })
    this.codeEl = this.view.querySelector(".js-code")
    this.nameEl = this.view.querySelector(".js-name")
    this.descriptionEl = this.view.querySelector(".js-description")
    this.submitSpinnerEl = this.view.querySelector(".js-submitSpinner")

    this.view.update(this.state)

    return wrapperEl
  }

  private createChildComponents() {
    this.stepSelector = this.dash.create(StepSelector)
    this.stepSelector.hide()
    this.el.appendChild(this.stepSelector.el)
  }


  /**
   * Listen to events from the form.
   */
  private async listenToForm() {
    this.codeEl.onkeyup = () => this.generateCode = false
    this.nameEl.onkeyup = () => {
      if (!this.project && this.generateCode && this.nameEl.value.length > 0)
        this.codeEl.value = this.nameEl.value.replace(/\s/g, "").slice(0, 5).toUpperCase()
    }
  }

  /**
   * Submit  button click handler.
   */
  private async onSubmit() {
    this.submitSpinnerEl.style.display = "inline"
    let code = this.codeEl.value.trim()
    let name = this.nameEl.value.trim()
    let description = this.descriptionEl.value.trim()
    if (code.length < 4 && name.length === 0) {
      this.submitSpinnerEl.style.display = "none"
      return
    }
    if (!this.project)
      await this.createProject(code, name, description)
    else
      await this.updateProject(name, description)
    this.submitSpinnerEl.style.display = "none"
  }

  /**
   * Set the ProjectForm current project.
   *
   * @param project the new project to use by the form
   */
  public setProject(project: ProjectModel | undefined) {
    this.project = project
    this.stepSelector.setProject(project)
    if (project) {
      this.codeEl.setAttribute("readonly", "true")
      this.generateCode = false
      this.fillFieldsWithCurrentProject()
      this.stepSelector.show()
    } else {
      this.codeEl.removeAttribute("readonly")
      this.clearFormFields()
      this.generateCode = true
      this.stepSelector.hide()
    }
  }

  /**
   * Request the creation of a new project by the model.
   *
   * @param code
   * @param name
   * @param description
   */
  private async createProject(code: string, name: string, description: string) {
    try {
      this.project = await this.model.exec("create", "Project", { code, name, description })
      this.codeEl.setAttribute("readonly", "true")
      this.fillFieldsWithCurrentProject()
      this.stepSelector.setProject(this.project)
      this.stepSelector.show()
    } catch (error) {
      console.error("Error while creating new project...")
    }
  }

  /**
   * Request for the update of the project in the model.
   *
   * @param name
   * @param description
   */
  private async updateProject(name: string, description: string) {
    if (!this.project)
      return
    try {
      await this.model.exec("update", "Project", {
        id: this.project.id,
        name,
        description
      })
    } catch (error) {
      console.error("Error while updating project...")
    }
    this.fillFieldsWithCurrentProject()
  }

  /**
   * Clear the content of the fields in the form.
   */
  public clearFormFields() {
    this.state.code = ""
    this.state.name = ""
    this.view.update(this.state)
    this.descriptionEl.value = ""
  }

  /**
   * Display the information about the project in the form fields.
   */
  public fillFieldsWithCurrentProject() {
    if (!this.project)
      return
    this.state.code = this.project.code
    this.state.name = this.project.name
    this.view.update(this.state)
    this.descriptionEl.value = this.project.description ? this.project.description : ""
  }

  /**
   * Tell if the ProjectForm is linked to a project.
   */
  public hasProject(): boolean {
    return this.project !== undefined
  }

  public activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el)
    if (!this.hasProject())
      this.nameEl.focus()
  }

  public deactivate() {
  }


  /**
   * Hide the ProjectForm.
   */
  public hide() {
    this.el.style.display = "none"
  }

  /**
   * Make the ProjectForm visible.
   */
  public show() {
    this.el.style.display = "block"
    if (!this.hasProject())
      this.nameEl.focus()
  }
}
