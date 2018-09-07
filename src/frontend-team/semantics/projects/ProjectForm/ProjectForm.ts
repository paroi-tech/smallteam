import { Dash, Log } from "bkb"
import { render, LtMonkberryView } from "@fabtom/lt-monkberry"
import { Model, ProjectModel, StepModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { ViewerController, Workspace } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import CheckboxMultiSelect from "../../../generics/CheckboxMultiSelect/CheckboxMultiSelect"
import { DropdownMenu, DropdownMenuOptions } from "../../../generics/DropdownMenu/DropdownMenu"
import StepBox from "../../steps/StepBox/StepBox"
import { ReorderModelEvent } from "../../../AppModel/ModelEngine"
import { createCustomMenuBtnEl } from "../../../generics/WorkspaceViewer/workspaceUtils"
import { WarningDialog } from "../../../../sharedFrontend/modalDialogs/modalDialogs"
import { OwnDash } from "../../../App/OwnDash"

const template = require("./ProjectForm.monk")

export default class ProjectForm implements Workspace {
  readonly el: HTMLElement
  private codeEl: HTMLInputElement
  private nameEl: HTMLInputElement
  private descriptionEl: HTMLTextAreaElement
  private stepsEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private stepMultiSelect: CheckboxMultiSelect<StepModel>
  private menu: DropdownMenu

  private view: LtMonkberryView
  private state = {
    code: "",
    name: "",
    description: ""
  }

  private model: Model
  private project?: ProjectModel
  private log: Log

  /**
   * The project code is automatically generated from the project name.
   * But the user has the ability to give a custom code. So when the user types in the
   * project code field, we use this flag to stop the generation of the project code.
   */
  private generateCode = true

  constructor(private dash: OwnDash, private reusable = false) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.view = render(template)
    this.el = this.view.rootEl()
    this.codeEl = this.view.ref("code")
    this.nameEl = this.view.ref("name")
    this.descriptionEl = this.view.ref("description")
    this.stepsEl = this.view.ref("steps")
    this.spinnerEl = this.view.ref("spinner")
    this.view.ref("submitBtn").addEventListener("click", ev => this.onSubmit())

    this.menu = this.createDropdownMenu()
    this.stepMultiSelect = this.createStepMultiSelect()
    this.listenToForm()

    this.dash.listenToModel(["createStep", "updateStep", "deleteStep"], () => {
      this.stepMultiSelect.setAllItems(this.model.global.steps)
      if (this.project)
        this.stepMultiSelect.selectItems(this.project.steps)
    })
    this.dash.listenTo<ReorderModelEvent>(this.model, "reorderStep", data => {
      this.stepMultiSelect.setAllItems(this.model.global.steps)
      if (this.project)
        this.stepMultiSelect.selectItems(this.project.steps)
    })
  }

  refresh() {
    if (!this.project)
      return
    this.state.code = this.project.code
    this.state.name = this.project.name
    this.state.description = this.project.description || ""
    this.view.update(this.state)
  }

  clearContent() {
    this.state.code = ""
    this.state.name = ""
    this.state.description = ""
    this.view.update(this.state)
  }

  hasProject(): boolean {
    return this.project !== undefined
  }

  getProject() {
    return this.project
  }

  setProject(p: ProjectModel) {
    this.project = p
    this.stepMultiSelect.selectItems(p ? p.steps : [])
    if (p) {
      this.codeEl.setAttribute("readonly", "true")
      this.generateCode = false
      this.refresh()
    } else {
      this.codeEl.removeAttribute("readonly")
      this.clearContent()
      this.generateCode = true
    }
  }

  activate(ctrl: ViewerController) {
    if (this.reusable)
      this.project = undefined
    ctrl.setContentEl(this.el)
    ctrl.setTitle(this.hasProject() ? "Edit ptoject" : "Create new project")
    ctrl.setTitleRightEl(this.menu.btnEl)
    this.nameEl.focus()
  }

  deactivate() {
  }

  private createDropdownMenu() {
    let menu = this.dash.create(DropdownMenu, {
        btnEl: createCustomMenuBtnEl()
      } as DropdownMenuOptions
    )

    menu.entries.createNavBtn({
      label: "Create another project",
      onClick: () => {
        this.project = undefined
        this.nameEl.focus()
      }
    })

    return menu
  }

  private createStepMultiSelect() {
    let ms = this.dash.create(
      CheckboxMultiSelect,
      "Steps",
      (dash: Dash, step: StepModel) => dash.create(StepBox, step)
    ) as any

    this.stepsEl.appendChild(ms.el)
    this.dash.listenToModel(["changeStep", "reorderStep"],
      data => ms.setAllItems(this.model.global.steps)
    )
    ms.setAllItems(this.model.global.steps)

    return ms
  }

  private async listenToForm() {
    this.codeEl.onkeyup = () => this.generateCode = false
    this.nameEl.onkeyup = () => {
      if (!this.project && this.generateCode && this.nameEl.value.length > 0)
        this.codeEl.value = this.nameEl.value.replace(/\s/g, "").slice(0, 5).toUpperCase()
    }
  }

  private async onSubmit() {
    this.spinnerEl.hidden = false

    let code = this.codeEl.value.trim()
    let name = this.nameEl.value.trim()
    let description = this.descriptionEl.value.trim()
    if (code.length < 4 && name.length === 0) {
      this.spinnerEl.hidden = true
      return
    }

    let stepIds = this.stepMultiSelect.getSelected().map(step => step.id)

    if (!this.project)
      await this.createProject(code, name, description, stepIds)
    else
      await this.updateProject(name, description, stepIds)

    this.spinnerEl.hidden = true
  }

  private async createProject(code: string, name: string, description: string, stepIds: string[]) {
    try {
      let p = await this.model.exec("create", "Project", { code, name, description, stepIds })
      this.project = p
    } catch (err) {
      await this.dash.create(WarningDialog).show("Unable to create new project.")
      this.log.error("Error while creating new project", err)
    }
  }

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
    } catch (err) {
      await this.dash.create(WarningDialog).show("Unable to update project.")
      this.log.error("Error while creating new project", err)
    }
    this.refresh()
  }
}
