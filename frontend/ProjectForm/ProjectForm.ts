import App from "../App/App"
import { Bkb, Dash } from "bkb"
import { Model, ProjectModel } from "../Model/Model"
import ProjectStepsPanel from "./ProjectStepsPanel/ProjectStepsPanel"
import { Panel } from "../PanelSelector/PanelSelector"
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

  /**
   * The project code is automatically generated from the project name.
   * But the user has the ability to give a custom code. So when the user types in the
   * project code field, we use this flag to stop the generation of the project code.
   */
  private generateCode = true

  /**
   * Create a new project form.
   */
  constructor(private dash: Dash<App>, private project?: ProjectModel) {
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
      this.stepsPanel = this.dash.create(ProjectStepsPanel, { args: [ this.project ] })
      this.stepsPanel.attachTo(this.container)
    }
  }

  public attachTo(el: HTMLElement) {
    el.appendChild(this.container)
  }

  private listenToForm() {
    this.codeField.onkeyup = () => {
      this.generateCode = false
    }

    this.nameField.onkeyup = () => {
      if (this.generateCode && this.nameField.value.length > 0) {
        let code = this.nameField.value.replace(/\s/g, "").slice(0, 5).toUpperCase()
        this.codeField.value = code
      }
    }

    this.submitBtn.onclick = () => {
      let spinner = this.submitBtn.querySelector("span")
      if (spinner)
        spinner.style.display = "inline"

      let code = this.codeField.value
      let name = this.nameField.value
      if (code.length < 4 && name.length === 0)
        return
      this.dash.app.model.exec("create", "Project", { code, name })
        .then(project => {
          if (spinner)
            spinner.style.display = "none"
          console.log(`Project ${project.name} successfully created...`)
        }).catch(error => {
          if (spinner)
            spinner.style.display = "none"
          console.error(error)
        })
    }
  }

  /**
   *
   * @param project - the project for which the form is open. If `undefined`, the form is open to create
   * *                a new project.
   */
  public show(project?: ProjectModel) {
    let panel = this.container.querySelector("ProjectStepsPanel")
    this.clearFormFields()
    if (panel)
        this.container.removeChild(panel)
    if (this.stepsPanel)
        this.container.removeChild(this.stepsPanel.getContainer())
    if (!project) {
      this.generateCode = true
    } else {
      this.project = project
      this.stepsPanel = this.dash.create(ProjectStepsPanel, { args: [ project ] })
      this.stepsPanel.attachTo(this.container)
    }
    this.container.style.display = "block"
  }

  public clearFormFields() {
    this.view.update({
      name: "",
      code: ""
    })
    this.descriptionField.value = ""
  }

  public hide() {
    this.container.style.display = "none"
  }
}
