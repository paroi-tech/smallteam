import App from "../App/App"
import { Bkb, Dash } from "bkb"
import { Model, ProjectModel } from "../Model/Model"
import ProjectStepsPanel from "./ProjectStepsPanel/ProjectStepsPanel"
import PanelSelector, { Panel } from "../PanelSelector/PanelSelector"
import { render } from "monkberry"
import directives from 'monkberry-directives'
import * as template from "./projectform.monk"

/**
 * Component that enables to create and edit project setings.
 */
export default class ProjectForm {
  readonly el: HTMLElement

  private codeEl: HTMLInputElement
  private nameEl: HTMLInputElement
  private descriptionEl: HTMLTextAreaElement
  private submitSpinnerEl: HTMLElement

  private view: MonkberryView
  private stepsPanel: ProjectStepsPanel

  private state = {
    name: "",
    code: "",
    ctrl: {
      submit: () => this.createNewProject().catch(console.log)
    }
  }

  private model: Model

  /**
   * The project code is automatically generated from the project name.
   * But the user has the ability to give a custom code. So when the user types in the
   * project code field, we use this flag to stop the generation of the project code.
   */
  private generateCode = true

  /**
   * Create a new project form.
   *
   * @param project: the project for which the form is created. If <code>undefined</code>, that means that
   *                 the form is opened to create a new project.
   */
  constructor(private dash: Dash<App>, private panel: PanelSelector, private project?: ProjectModel) {
    this.model = this.dash.app.model
    this.el = this.initComponents()
    if (this.project) {
      this.codeEl.setAttribute("readonly", "true")
      this.fillFormFieldsWithProject()
      this.stepsPanel.setProject(this.project)
    }
    this.listenToForm()
  }

  /**
   * Create ProjectForm elements from template.
   */
  private initComponents() {
    let wrapperEl = document.createElement("div")
    wrapperEl.classList.add("ProjectForm")
    this.view = render(template, wrapperEl, { directives })
    this.codeEl = this.view.querySelector(".js-code")
    this.nameEl = this.view.querySelector(".js-name")
    this.descriptionEl = this.view.querySelector(".js-description")
    this.submitSpinnerEl = this.view.querySelector(".js-submitSpinner")

    this.stepsPanel = this.dash.create(ProjectStepsPanel, { args: [this.project] })
    wrapperEl.appendChild(this.stepsPanel.el)

    this.view.update(this.state)

    return wrapperEl
  }

  /**
   * Listen to events from the form.
   */
  private async listenToForm() {
    if (!this.project) {
      this.codeEl.onkeyup = () => this.generateCode = false
      this.nameEl.onkeyup = () => {
        if (!this.project && this.generateCode && this.nameEl.value.length > 0)
          this.codeEl.value = this.nameEl.value.replace(/\s/g, "").slice(0, 5).toUpperCase()
      }
    } else {
      this.generateCode = false
    }
  }

  private async createNewProject() {
    this.submitSpinnerEl.style.display = "inline"
    let code = this.codeEl.value.trim()
    let name = this.nameEl.value.trim()
    let description = this.descriptionEl.value.trim()
    if (code.length < 4 && name.length === 0)
      return
    if (!this.project) {
      console.log(`Attempting to create new project with code ${code}`)
      await this.createProject(code, name, description)
    } else {
      console.log(`Attempting to update project ${code}`)
      await this.updateProject(name, description)
    }
    this.submitSpinnerEl.style.display = "none"
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
      this.panel.linkFormToProject(this, this.project)
      this.codeEl.setAttribute("readonly", "true")
      this.fillFormFieldsWithProject()
      this.stepsPanel.setProject(this.project)
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Request for the update of the project in the model.
   *
   * @param name
   * @param description
   */
  private async updateProject(name: string, description: string) {
    try {
      let project = await this.model.exec("update", "Project", {
        id: this.project!.id,
        name,
        description
      })
    } catch (error) {
      console.error(error)
    }
    this.fillFormFieldsWithProject()
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
  public fillFormFieldsWithProject() {
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

  /**
   * Hide the ProjectForm.
   * If the project is not linled to a project, also remove the ProjectForm from the DOM.
   */
  public hide() {
    this.el.style.display = "none"
    if (!this.hasProject() && this.el.parentElement)
      this.el.parentElement.removeChild(this.el)
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
