import { Dash, Bkb, Component } from "bkb"
import App from "../App/App"
import { Menu, MenuItem } from "../Menu/Menu"
import { DropdownMenu } from "../DropdownMenu/DropdownMenu"
import ProjectWorkspace from "../ProjectWorkspace/ProjectWorkspace"
import ProjectForm from "../ProjectForm/ProjectForm"
import StepTypeWorkspace from "../StepTypeWorkspace/StepTypeWorkspace"
import ContributorWorkspace from "../ContributorWorkspace/ContributorWorkspace"
import { Model, ProjectModel, TaskModel } from "../AppModel/AppModel"
import { render } from "monkberry"
import * as template from "./workspaceviewer.monk"

// const template = require("html-loader!./panelselector.html")

/**
 * Properties required for an Component in order to be displayed in PanelSelector.
 */
export interface Workspace {
  hide()
  show()
  el: HTMLElement
}

/**
 * Several types of components are displayed in the WorkspaceViewer.
 *
 * We store data about components currently displayed in the WorkspaceViewer. For now, we display
 * four types of components in the PanelSelector:
 *    - ProjectWorkspace
 *    - ProjectForm
 *    - StepsTypePanel
 *    - ContributorPanel
 */
interface WorkspaceInfo {
  workspace?: Workspace
  projectModel?: ProjectModel
  type: typeof ProjectWorkspace | typeof ProjectForm | typeof StepTypeWorkspace | typeof ContributorWorkspace
}

/**
 * Options displayed in the dropdown menu of the PanelSelector.
 */
const settingMenuItems = [
  {
    id: "createProject",
    label: "New project",
    eventName: "createProject",
    data: undefined
  },
  {
    id: "manageStepTypes",
    label: "Manage step types",
    eventName: "manageStepTypes",
    data: undefined
  },
  {
    id: "manageContributors",
    label: "Contributors",
    eventName: "manageContributors",
    data: undefined
  }
]

export default class PanelSelector {
  readonly el: HTMLElement

  private model: Model
  private menu: Component<Menu>
  private settingMenu: Component<DropdownMenu>
  private currentWorkspace: Workspace | undefined

  private projectForm: ProjectForm

  private workspaceMap: Map<string, WorkspaceInfo> = new Map()

  private view: MonkberryView

  private menuEl: HTMLElement
  private dropdownMenuEl: HTMLElement
  private titleEl: HTMLElement
  private bodyEl: HTMLElement

  private projectMap: Map<string, ProjectModel> = new Map()

  /**
   * Create a new WorkspaceViewer.
   *
   * @param dash
   */
  constructor(private dash: Dash<App>) {
    this.model = dash.app.model
    this.el = this.createView()
    this.createChildComponents()
    this.listenToModel()
    this.listenToEvents()
    this.loadProjects()
    // makeTests(this.el, this.dash.app.model) // TODO:  Remove this line
  }

  private createView() {
    let wrapperEl = document.createElement("div")
    this.view = render(template, wrapperEl)

    this.menuEl = this.view.querySelector(".js-menuLeft")
    this.dropdownMenuEl = this.view.querySelector(".js-menuRight")
    this.titleEl = this.view.querySelector(".js-title")
    this.bodyEl = this.view.querySelector(".js-body")

    return wrapperEl
  }

  /**
   * Create WorkspaceViewer subcomponents.
   */
  private createChildComponents() {
    this.menu = this.dash.create(Menu, {
      args: ["Project selection menu"]
    })
    this.menuEl.appendChild(this.menu.el)

    this.settingMenu = this.dash.create(DropdownMenu, {
      args: ["Global settings menu", "right"]
    })
    this.dropdownMenuEl.appendChild(this.settingMenu.el)
    this.settingMenu.addItems(settingMenuItems)

    this.projectForm = this.dash.create(ProjectForm, { args: [] })
    this.projectForm.hide()
    this.bodyEl.appendChild(this.projectForm.el)

    // We have to do this, or else the project board won't be able to display StepTypePanel
    // and ContributorPanel later. See the showSettingPanel() method for details.
    this.workspaceMap.set("stepTypeWorkspace", { type: StepTypeWorkspace })
    this.workspaceMap.set("contributorWorkspace", { type: ContributorWorkspace })
  }

  /**
   * Listen to event from child components.
   */
  private listenToEvents() {
    this.menu.bkb.on<string>("projectSelected", "dataFirst", id => this.showProjectWorkspace(id))
    this.settingMenu.bkb.on("createProject", "eventOnly", () => this.showProjectForm())
    this.settingMenu.bkb.on("manageStepTypes", "eventOnly", ev => this.showSettingWorksapce("stepTypeWorkspace"))
    this.settingMenu.bkb.on("manageContributors", "eventOnly", ev => this.showSettingWorksapce("contributorWorkspace"))
  }

  /**
   * Listen to events from model.
   * The following events are handled:
   *  - Project creation
   *  - Project deletion
   */
  private listenToModel() {
    // Project creation.
    this.model.on("createProject", "dataFirst", data => this.addProject(data.model))

    // Project deletion.
    this.model.on("change", "dataFirst", data => {
      if (data.cmd !== "delete" || data.type !==  "Project")
        return
      let projectId = data.id as string
      this.projectMap.delete(projectId)
      let panelInfo = this.workspaceMap.get("ProjectWorkspace" + ":" + projectId)
      if (panelInfo && panelInfo.type === ProjectWorkspace && panelInfo.workspace)
        this.bodyEl.removeChild(panelInfo.workspace.el)
      this.menu.removeItem(projectId)
    })
  }

  /**
   * Load projects from model and request the creation of ProjectWorkspace for each of the projects.
   */
  private async loadProjects() {
    try {
      let projects = this.model.global.projects
      if (projects.length === 0) {
        if (confirm("No project to load from server. Do you want to create a new one?"))
          this.showProjectForm()
      } else {
        for (let p of projects)
          this.addProject(p)
      }
    } catch (err) {
      console.error("An error occured while loading projects from server.", err)
    }
  }

  /**
   * Add a project the panel.
   * An entry is added to the menu for the project.
   *
   * @param project the project to add
   */
  private addProject(project: ProjectModel) {
    this.projectMap.set(project.id, project)
    let boardId = "ProjectWorkspace" + ":" + project.id
    this.workspaceMap.set(boardId, {
      projectModel: project,
      type: ProjectWorkspace
    })
    this.menu.addItem({
      id: project.id,
      label: project.code,
      eventName: "projectSelected",
      data: project.id
    })
  }

  /**
   * Change the panel shown by the PanelSelector.
   *
   * @param w the panel to show
   */
  private setCurrentWorkspace(w: Workspace) {
    if (this.currentWorkspace)
      this.currentWorkspace.hide()
    this.currentWorkspace = w
    w.show()
  }

  /**
   * Show the board of a given project.
   *
   * @param projectId the ID of the project which board has to be shown
   */
  private showProjectWorkspace(projectId: string) {
    let workspaceId = "ProjectWorkspace" + ":" + projectId
    let info = this.workspaceMap.get(workspaceId)
    if (!info)
      throw new Error(`Unknown project panel ID: ${projectId} in PanelSelector.`)
    if (!info.workspace) {
      info.workspace = this.dash.create(ProjectWorkspace, {
        args: [ info.projectModel ]
      })
      this.bodyEl.appendChild(info.workspace.el)
    }
    this.setCurrentWorkspace(info.workspace)
  }

  /**
   * Show the project form in the PanelSelector.
   *
   * @param project
   */
  private showProjectForm(project?: ProjectModel) {
    this.projectForm.setProject(project)
    this.setCurrentWorkspace(this.projectForm)
  }

  // /**
  //  * Inform the PanelSelector to use a ProjectForm for a given project.
  //  * This function is necessary since ProjectForms are not created for a specific project. So after a
  //  * ProjectForm was used to create a project, it has to prevent its PanelSelector that it is now linked to
  //  * a project.
  //  *
  //  * @param form
  //  * @param project
  //  */
  // public linkFormToProject(form: ProjectForm, project: ProjectModel) {
  //   let info: PanelInfo = {
  //     panel: form,
  //     projectModel: project,
  //     type: ProjectForm
  //   }
  //   let formId = "ProjectForm" + ":" + project.id
  //   this.panelMap.set(formId, info)
  // }

  /**
   * Display a setting workspace.
   * Setting workspaces are:
   *  - StepTypeWorkspace
   *  - ContributorWorkspace
   * @param panelId
   */
  private showSettingWorksapce(panelId: string) {
    let info = this.workspaceMap.get(panelId)
    if (!info)
      throw new Error(`Unknown setting workspace id: ${panelId}`)
    if (!info.workspace) {
      if (info.type === StepTypeWorkspace) {
        info.workspace = this.dash.create<StepTypeWorkspace>(info.type)
        this.bodyEl.appendChild(info.workspace.el)
      } else if (info.type === ContributorWorkspace) {
        info.workspace = this.dash.create<ContributorWorkspace>(info.type)
        this.bodyEl.appendChild(info.workspace.el)
      } else
        throw new Error(`Unknown Workspace type: ${info.type}`)
    }
    this.setCurrentWorkspace(info.workspace)
  }
}

// // TODO: remove this...
// // The following code has been added for tests purpose.
// import * as $ from "jquery"
// import { StepModel, StepTypeModel } from "../AppModel/AppModel"

// function makeTests(el, model: Model) {
//   model.on("change", "dataFirst", data => {
//     console.log(`++ event "change"`, data.type, "; ID:", data.id, "; data:", data)
//   })
//   model.on("update", "dataFirst", data => {
//     console.log(`++ event "update"`, data.type, "; ID:", data.id, "; data:", data)
//   })
//   model.on("updateProject", "dataFirst", data => {
//     console.log(`++ event "updateProject"`, data.type, "; ID:", data.id, "; data:", data)
//   })
//   model.on("createStepType", "dataFirst", data => {
//     console.log(`++ event "createStepType"`, data.type, "; ID:", data.id, "; data:", data)
//   })

//   let type: StepTypeModel
//   $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Add type</button>`).appendTo(el).click(async () => {
//     let t = await model.exec("create", "StepType", {
//       name: "TODO"
//     })
//     console.log("Created type:", t)
//     type = t
//   })
//   $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Get types</button>`).appendTo(el).click(async () => {
//     let types = await model.query("StepType")
//     console.log("Loaded types:", types)
//   })
//   $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Get contributors</button>`).appendTo(el).click(async () => {
//     let contributors = await model.query("Contributor")
//     console.log("Loaded contributors:", contributors)
//   })
//   $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Batch</button>`).appendTo(el).click(async () => {
//     let batch = model.createCommandBatch();

//     batch.query("StepType").then(result => {
//       console.log("Queryied steptype:", result)
//     })
//     batch.query("Project", {archived: false}).then(result => {
//       console.log("Queryied Project:", result)
//     })

//     // batch.exec("delete", "Step", {
//     //   id: "3"
//     // }).then(result => {
//     //   console.log("Deleted step:", result)
//     // })
//     // batch.exec("create", "Step", {
//     //   projectId: "1",
//     //   typeId: "2"
//     // }).then(step => {
//     //   console.log("Created step:", step)
//     // })

//     let results = await batch.sendAll()
//     console.log("Batch result:", results)
//   })
//   $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Add task</button>`).appendTo(el).click(async () => {
//     let step = await model.exec("create", "Task", {
//       label: "ABC",
//       createdById: "1",
//       curStepId: "1",
//       parentTaskId: "5"
//     })
//     console.log("Created step:", step)
//   })
//   $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Update project</button>`).appendTo(el).click(async () => {
//    let project = await model.exec("update", "Project", {
//       id: "1",
//       description: "Hop la description",
//       name: "Beau projet"
//     })
//     console.log("Updated project:", project, project.tasks)
//   })
//   $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Reorder types</button>`).appendTo(el).click(async () => {
//     await model.reorder("StepType", ["4", "3", "5"])
//     console.log("Reordered StepTypes...")
//     let types = await model.query("StepType")
//     console.log("Ordered types:", types)
//   })
// }
