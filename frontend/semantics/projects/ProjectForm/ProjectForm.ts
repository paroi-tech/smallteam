import { PublicDash, Dash } from "bkb"
import { render } from "monkberry"
import directives from "monkberry-directives"
import { Model, ProjectModel, StepModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { ViewerController, Workspace } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import CheckboxMultiSelect from "../../../generics/CheckboxMultiSelect/CheckboxMultiSelect"
import { DropdownMenu } from "../../../generics/DropdownMenu/DropdownMenu"
import StepBox from "../../steps/StepBox/StepBox"
import { ReorderModelEvent } from "../../../AppModel/ModelEngine"

const template = require("./ProjectForm.monk")

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

  private stepMultiSelect: CheckboxMultiSelect<StepModel>
  private menu: DropdownMenu

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

  constructor(private dash: Dash<App>, private reusable = false) {
    this.model = this.dash.app.model
    this.el = this.createHtmlElements()
    this.menu = this.createDropdownMenu()
    this.stepMultiSelect = this.createStepMultiSelect()
    this.listenToForm()

    let events = ["createStep", "updateStep", "deleteStep"]
    this.dash.listenTo<UpdateModelEvent>(this.model, events).onEvent(ev => {
      this.stepMultiSelect.setAllItems(this.model.global.steps)
      if (this.project)
        this.stepMultiSelect.selectItems(this.project.steps)
    })

    this.dash.listenTo<ReorderModelEvent>(this.model, "reorderStep").onData(data => {
      this.stepMultiSelect.setAllItems(this.model.global.steps)
      if (this.project)
        this.stepMultiSelect.selectItems(this.project.steps)
    })
  }

  private createDropdownMenu() {
    let menu = this.dash.create(DropdownMenu)

    menu.addItem({
      id: "clear",
      label: "Create another project"
    })
    this.dash.listenTo(menu, "select").onEvent(ev => {
      this.setProject(undefined)
      this.nameEl.focus()
    })

    return menu
  }

  private createStepMultiSelect() {
    let multiSelect = this.dash.create(
      CheckboxMultiSelect,
      "Steps",
      (dash: Dash, step: StepModel) => dash.create(StepBox, step)
    )

    this.el.appendChild(multiSelect.el)
    this.dash.listenTo<UpdateModelEvent>(this.model, "changeStep").onData(data => {
      multiSelect.setAllItems(this.model.global.steps)
    })
    this.dash.listenTo<UpdateModelEvent>(this.model, "reorderStep").onData(data => {
      multiSelect.setAllItems(this.model.global.steps)
    })
    multiSelect.setAllItems(this.model.global.steps)

    return multiSelect
  }

  /**
   * Create ProjectForm elements from template.
   */
  private createHtmlElements() {
    this.view = render(template, document.createElement("div"), { directives })

    let el = this.view.nodes[0] as HTMLDivElement

    this.codeEl = el.querySelector(".js-code") as HTMLInputElement
    this.nameEl = el.querySelector(".js-name") as HTMLInputElement
    this.descriptionEl = el.querySelector(".js-description") as HTMLTextAreaElement
    this.submitSpinnerEl = el.querySelector(".js-submit-spinner") as HTMLElement

    this.view.update(this.state)

    return el
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

  private async onSubmit() {
    this.submitSpinnerEl.style.display = "inline"

    let code = this.codeEl.value.trim()
    let name = this.nameEl.value.trim()
    let description = this.descriptionEl.value.trim()

    if (code.length < 4 && name.length === 0) {
      this.submitSpinnerEl.style.display = "none"
      return
    }

    let stepIds = this.stepMultiSelect.getSelected().map(step => step.id)

    if (!this.project)
      await this.createProject(code, name, description, stepIds)
    else
      await this.updateProject(name, description, stepIds)

    this.submitSpinnerEl.style.display = "none"
  }

  /**
   * Set the ProjectForm current project.
   *
   * @param project the new project to use by the form
   */
  public setProject(project: ProjectModel | undefined) {
    this.project = project
    this.stepMultiSelect.selectItems(project ? project.steps : [])
    if (project) {
      this.codeEl.setAttribute("readonly", "true")
      this.generateCode = false
      this.fillFieldsWithCurrentProject()
    } else {
      this.codeEl.removeAttribute("readonly")
      this.clearFormFields()
      this.generateCode = true
    }
  }

  /**
   * Request the creation of a new project by the model.
   *
   * @param code
   * @param name
   * @param description
   */
  private async createProject(code: string, name: string, description: string, stepIds: string[]) {
    try {
      let project = await this.model.exec("create", "Project", { code, name, description, stepIds })
      this.setProject(project)
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
  private async updateProject(name: string, description: string, stepIds: string[]) {
    if (!this.project)
      return
    try {
      await this.model.exec("update", "Project", {
        id: this.project.id,
        name,
        description,
        stepIds
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
    if (this.reusable)
      this.setProject(undefined)
    ctrl.setContentEl(this.el)
    ctrl.setTitle(this.hasProject() ? "Edit ptoject" : "Create new project")
    ctrl.setTitleRightEl(this.menu.el)
    this.nameEl.focus()
  }

  public deactivate() {
  }

}
