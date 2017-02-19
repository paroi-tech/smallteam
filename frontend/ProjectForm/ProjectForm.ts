import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"
import Model from "../Model/Model"
import * as MonkBerry from "monkberry"

// const template = require("html-loader!./projectform.html")
import * as template  from "./projectform.monk"

/**
 * Component that enables to create and edit project setings.
 */
export default class ProjectForm {
  private container: HTMLDivElement
  private fieldsContainer: HTMLDivElement
  private submitBtn: HTMLButtonElement
  private codeField: HTMLInputElement
  private nameField: HTMLInputElement

  private view: MonkberryView

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
    this.initComponents()
    this.listenToForm()
  }

  private initComponents() {
    this.container = document.createElement("div")
    this.container.classList.add("ProjectForm")

    this.view = MonkBerry.render(template, this.container)
    this.fieldsContainer = this.view.querySelector(".js-form")
    this.submitBtn = this.view.querySelector(".js-submit-btn")
    this.codeField = this.view.querySelector(".js-project-code")
    this.nameField = this.view.querySelector(".js-project-name")
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
      spinner!.style.visibility = "visible"

      let code = this.codeField.value
      let name = this.nameField.value

      this.dash.app.model.exec("create", "Project", { code, name })
      .then(project => {
        spinner!.style.visibility = "hidden"
        console.log(`Project ${project.name} successfully created...`)
      }).catch(error => {
        spinner!.style.visibility = "hidden"
        console.error(error)
      })
    }
  }

  public show() {
    this.view.update({
      name: "",
      code: "",
      description: ""
    })
    this.container.style.visibility = "visible"
    this.generateCode = true
  }

  public hide() {
    this.container.style.visibility = "hidden";
  }
}