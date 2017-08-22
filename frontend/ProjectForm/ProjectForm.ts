import App from "../App/App"
import { Bkb, Dash } from "bkb"
import { Model, ProjectModel } from "../Model/Model"
import ProjectStepsPanel from "./ProjectStepsPanel/ProjectStepsPanel"
import PanelSelector, { Panel } from "../PanelSelector/PanelSelector"
import * as MonkBerry from "monkberry"

import * as template from "./projectform.monk"

/**
 * Component that enables to create and edit project setings.
 */
export default class ProjectForm {
  private container: HTMLDivElement
  private formContainer: HTMLDivElement
  private fieldsContainer: HTMLDivElement
  private submitBtn: HTMLButtonElement
  private codeField: HTMLInputElement
  private nameField: HTMLInputElement
  private descriptionField: HTMLTextAreaElement

  private view: MonkberryView
  private stepsPanel: ProjectStepsPanel

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
    this.initComponents()
    this.listenToForm()
  }

  /**
   * Create ProjectForm elements from template.
   */
  private initComponents() {
    this.container = document.createElement("div")
    this.container.classList.add("ProjectForm")

    this.formContainer = document.createElement("div")
    this.view = MonkBerry.render(template, this.formContainer)
    this.fieldsContainer = this.view.querySelector(".js-form")
    this.submitBtn = this.view.querySelector(".js-submit-btn")
    this.codeField = this.view.querySelector(".js-project-code")
    this.nameField = this.view.querySelector(".js-project-name")
    this.descriptionField = this.view.querySelector(".js-description")
    this.container.appendChild(this.formContainer)

    if (this.project) {
      this.createStepsPanel()
      this.codeField.setAttribute("readonly", "true")
      this.fillFormFieldsWithProject()
    }
    this.listenToForm()
  }

  /**
   * Add the ProjectForm to an element.
   *
   * @param el - the element which the form is added to
   */
  public attachTo(el: HTMLElement) {
    el.appendChild(this.container)
  }

  /**
   * Create the StepsPanel subcomponent.
   * Called if the ProjectForm was created for a project or when the ProjectForm is used to
   * create a new project.
   */
  private createStepsPanel() {
    this.stepsPanel = this.dash.create(ProjectStepsPanel, { args: [ this.project ] })
    this.stepsPanel.attachTo(this.container)
  }

  /**
   * Listen to events from the form.
   */
  private async listenToForm() {
    if (!this.project) {
      this.codeField.onkeyup = () => this.generateCode = false
      this.nameField.onkeyup = () => {
        if (!this.project && this.generateCode && this.nameField.value.length > 0)
          this.codeField.value = this.nameField.value.replace(/\s/g, "").slice(0, 5).toUpperCase()
      }
    } else {
      this.generateCode = false
    }

    this.submitBtn.onclick = async () => {
      let spinner = this.submitBtn.querySelector("span")
      if (spinner)
         spinner.style.display = "inline"
      let code = this.codeField.value.trim()
      let name = this.nameField.value.trim()
      let description = this.descriptionField.value.trim()
      if (code.length < 4 && name.length === 0)
        return
      if (!this.project) {
        console.log(`Attempting to create new project with code ${code}`)
        await this.createProject(code, name, description)
      } else {
        console.log(`Attempting to update project ${code}`)
        await this.updateProject(name, description)
      }
      if (spinner)
        spinner.style.display = "none"
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
      let project = await this.model.exec("create", "Project", { code, name, description })
      this.project = project
      this.panel.linkFormToProject(this, project)
      this.codeField.setAttribute("readonly", "true")
      this.fillFormFieldsWithProject()
      this.createStepsPanel()
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
    this.view.update({
      name: "",
      code: ""
    })
    this.descriptionField.value = ""
  }

  /**
   * Display the information about the project in the form fields.
   */
  public fillFormFieldsWithProject() {
    if (!this.project)
      return
    this.view.update({
      name: this.project.name,
      code: this.project.code,
    })
    this.descriptionField.value = this.project.description? this.project.description: ""
  }

  /**
   * Tell if the ProjectForm is linked to a project.
   */
  public hasProject(): boolean {
    return this.project != undefined
  }

  /**
   * Hide the ProjectForm.
   * If the project is not linled to a project, also remove the ProjectForm from the DOM.
   */
  public hide() {
    this.container.style.display = "none"
    if (!this.hasProject() && this.container.parentElement)
      this.container.parentElement.removeChild(this.container)
  }

  /**
   * Make the ProjectForm visible.
   */
  public show() {
    this.container.style.display = "block"
    if (!this.hasProject())
      this.nameField.focus()
  }
}
