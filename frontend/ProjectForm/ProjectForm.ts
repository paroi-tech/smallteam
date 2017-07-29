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

  public attachTo(el: HTMLElement) {
    el.appendChild(this.container)
  }

  private createStepsPanel() {
    this.stepsPanel = this.dash.create(ProjectStepsPanel, { args: [ this.project ] })
    this.stepsPanel.attachTo(this.container)
  }

  private listenToForm() {
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
      // let spinner = this.submitBtn.querySelector("span")
      // if (spinner)
      //   spinner.style.display = "inline"

      let code = this.codeField.value.trim()
      let name = this.nameField.value.trim()
      let description = this.descriptionField.value.trim()
      if (code.length < 4 && name.length === 0)
        return
      try {
        if (!this.project) {
          console.log("Attempting to create new project:", code)
          await this.createProject(code, name, description)
        } else {
          console.log("Attempting to update project:", code)
          await this.updateProject(name, description)
        }
        // let project = await this.dash.app.model.exec("create", "Project", { code, name })
        // console.log(`Project ${project.name} successfully created...`)
      } catch (err) {
        console.error(err)
      } finally {
        // if (spinner)
        //   spinner.style.display = "none"
      }
    }
  }

  private async createProject(code: string, name: string, description: string) {
    console.log("In createProject()...")
    let spinner = this.submitBtn.querySelector("span")
    if (spinner)
      spinner.style.display = "inline"
    try {
      let project = await this.model.exec("create", "Project", { code, name, description })
      if (spinner)
        spinner.style.display = "none"
      console.log(`Project ${project.name} successfully createa...`)
      this.project = project
      this.panel.linkFormToProject(this, project)
      this.codeField.setAttribute("readonly", "true")
      this.fillFormFieldsWithProject()
      this.createStepsPanel()
    } catch (error) {
      if (spinner)
        spinner.style.display = "none"
      console.error(error)
    }
  }

  private async updateProject(name: string, description: string) {
    // let spinner = this.submitBtn.querySelector("span")
    // if (spinner)
    //   spinner.style.display = "inline"
    // this.model.exec("update", "Project", { name, description }).then(project => {
    //   if (spinner)
    //     spinner.style.display = "none"
    //   console.log(`Project ${project.name} successfully updated...`)
    // }).catch(error => {
    //   if (spinner)
    //     spinner.style.display = "none"
    //   console.error(error)
    // }).then(() => this.fillFormFieldsWithProject())
  }

  // TODO: Remove this function. It's no longer useful.
  // public show(project?: ProjectModel) {
  //   let panel = this.container.querySelector("ProjectStepsPanel")
  //   this.clearFormFields()
  //   if (panel)
  //       this.container.removeChild(panel)
  //   if (this.stepsPanel)
  //       this.container.removeChild(this.stepsPanel.getContainer())
  //   if (!project) {
  //     this.generateCode = true
  //   } else {
  //     this.project = project
  //     this.stepsPanel = this.dash.create(ProjectStepsPanel, { args: [ project ] })
  //     this.stepsPanel.attachTo(this.container)
  //   }
  //   this.container.style.display = "block"
  // }

  public clearFormFields() {
    this.view.update({
      name: "",
      code: ""
    })
    this.descriptionField.value = ""
  }

  public fillFormFieldsWithProject() {
    if (!this.project)
      return
    this.view.update({
      name: this.project.name,
      code: this.project.code,
    })
    this.descriptionField.value = this.project.description? this.project.description: ""
  }

  public hasProject(): boolean {
    return this.project != undefined
  }

  public hide() {
    this.container.style.display = "none"
    if (!this.hasProject() && this.container.parentElement)
      this.container.parentElement.removeChild(this.container)
  }

  public show() {
    this.container.style.display = "block"
    if (!this.hasProject())
      this.nameField.focus()
  }
}
