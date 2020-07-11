import WarningDialog from "@smallteam-local/shared-ui/modal-dialogs/WarningDialog"
import { Log } from "bkb"
import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { Model, ProjectModel, StepModel } from "../../AppModel/AppModel"
import { DropdownMenu } from "../../generics/DropdownMenu"
import MultiSelect, { MultiSelectOptions } from "../../generics/MultiSelect"
import { createCustomMenuBtnEl } from "../../generics/workspaceUtils"
import { ViewerController, Workspace } from "../../generics/WorkspaceViewer"
import StepBox from "../steps/StepBox"

const template = handledom`
<div class="ProjectForm">
  <div class="FieldGroup" h="form">
    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Project Name</span>
      <input class="Field-input" type="text" h="name" value={{ name }}>
    </label>

    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Project Code</span>
      <input class="Field-input" type="text" h="code" value={{ code }}>
    </label>

    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Description</span>
      <textarea class="Field-input -textarea" h="description" value={{ description }}></textarea>
    </label>

    <div class="FieldGroup-item" h="steps"></div>

    <div class="FieldGroup-action">
      <button class="Btn WithLoader -right" type="button" h="submitBtn">
        Submit
        <span class="WithLoader-l" h="spinner" hidden></span>
      </button>
    </div>
  </div>
</div>
`

export default class ProjectForm implements Workspace {
  readonly el: HTMLElement
  private codeEl: HTMLInputElement
  private nameEl: HTMLInputElement
  private descriptionEl: HTMLTextAreaElement
  private spinnerEl: HTMLElement

  private stepSelector: MultiSelect<StepModel>
  private menu: DropdownMenu

  private update: (args: any) => void
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

    const { root, ref, update } = template()
    this.update = update
    this.el = root
    this.codeEl = ref("code")
    this.nameEl = ref("name")
    this.descriptionEl = ref("description")
    this.spinnerEl = ref("spinner")
    ref("submitBtn").addEventListener("click", () => this.onSubmit())

    this.menu = this.createDropdownMenu()

    this.stepSelector = dash.create<MultiSelect<StepModel>, MultiSelectOptions<StepModel>>(
      MultiSelect,
      {
        title: "Steps",
        createItem: step => dash.create(StepBox, step)
      }
    )
    dash.listenToModel(["changeStep", "reorderStep"], () => {
      this.stepSelector.fillWith(this.model.global.steps)
      if (this.project)
        this.stepSelector.selectItems(this.project.steps)
    })
    this.stepSelector.fillWith(this.model.global.steps)

    ref("steps").appendChild(this.stepSelector.el)

    this.codeEl.addEventListener("input", () => this.generateCode = false)
    this.nameEl.addEventListener("input", () => {
      if (!this.project && this.generateCode && this.nameEl.value.length > 0)
        this.codeEl.value = this.nameEl.value.replace(/\s/g, "").slice(0, 5).toUpperCase()
    })
  }

  refresh() {
    if (!this.project)
      return
    this.state.code = this.project.code
    this.state.name = this.project.name
    this.state.description = this.project.description || ""
    this.update(this.state)
  }

  clearContent() {
    this.state.code = ""
    this.state.name = ""
    this.state.description = ""
    this.update(this.state)
  }

  hasProject(): boolean {
    return this.project !== undefined
  }

  getProject() {
    return this.project
  }

  setProject(p: ProjectModel) {
    this.project = p
    this.stepSelector.selectItems(p ? p.steps : [])
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

  private createDropdownMenu() {
    const menu = this.dash.create(DropdownMenu, {
      btnEl: createCustomMenuBtnEl()
    })

    menu.entries.createNavBtn({
      label: "Create another project",
      onClick: () => {
        this.project = undefined
        this.nameEl.focus()
      }
    })

    return menu
  }

  private async onSubmit() {
    this.spinnerEl.hidden = false

    const code = this.codeEl.value.trim()
    const name = this.nameEl.value.trim()
    const description = this.descriptionEl.value.trim()
    if (code.length < 4 && name.length === 0) {
      this.spinnerEl.hidden = true
      return
    }

    const stepIds = this.stepSelector.getSelected().map(step => step.id)

    if (!this.project)
      await this.createProject(code, name, description, stepIds)
    else
      await this.updateProject(name, description, stepIds)

    this.spinnerEl.hidden = true
  }

  private async createProject(code: string, name: string, description: string, stepIds: string[]) {
    try {
      const p = await this.model.exec("create", "Project", { code, name, description, stepIds })
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
