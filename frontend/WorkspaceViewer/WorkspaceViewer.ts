import { Dash, Bkb, Component } from "bkb"
import App from "../App/App"
import { Menu, MenuItem } from "../Menu/Menu"
import { DropdownMenu } from "../DropdownMenu/DropdownMenu"
import ProjectWorkspace from "../ProjectWorkspace/ProjectWorkspace"
import ProjectForm from "../ProjectForm/ProjectForm"
import StepTypePanel from "../StepTypePanel/StepTypePanel"
import ContributorPanel from "../ContributorPanel/ContributorPanel"
import { Model, ProjectModel, TaskModel } from "../AppModel/AppModel"
import ProjectStepsPanel from "../ProjectForm/ProjectStepsPanel/ProjectStepsPanel"
import { render } from "monkberry"
import * as template from "./workspaceviewer.monk"

// const template = require("html-loader!./panelselector.html")

/**
 * Properties required for an Component in order to be displayed in PanelSelector.
 */
export interface Panel {
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
interface PanelInfo {
  panel?: Panel
  projectModel?: ProjectModel
  type: typeof ProjectWorkspace | typeof ProjectForm | typeof StepTypePanel | typeof ContributorPanel
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
  private currentPanel: Panel | undefined

  private projectForm: ProjectForm

  private panelMap: Map<string, PanelInfo> = new Map()

  private view: MonkberryView

  private menuEl: HTMLElement
  private dropdownMenuEl: HTMLElement
  private panelContainerEl: HTMLElement

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
    makeTests(this.el, this.dash.app.model) // TODO:  Remove this line
  }

  private createView() {
    let wrapperEl = document.createElement("div")
    this.view = render(template, wrapperEl)

    this.menuEl = this.view.querySelector(".js-menuLeft")
    this.dropdownMenuEl = this.view.querySelector(".js-menuRight")
    this.panelContainerEl = this.view.querySelector(".js-panelContainer")

    return wrapperEl
  }

  /**
   * Create PanelSelector subcomponents.
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
    this.panelContainerEl.appendChild(this.projectForm.el)

    // We have to do this, or else the project board won't be able to display StepTypePanel
    // and ContributorPanel later. See the showSettingPanel() method for details.
    this.panelMap.set("stepTypePanel", { type: StepTypePanel })
    this.panelMap.set("contributorPanel", { type: ContributorPanel })
  }

  /**
   * Listen to event from child components.
   */
  private listenToEvents() {
    this.dash.listenToChildren<ProjectModel>("editProject").call("dataFirst", p => this.showProjectForm(p))
    this.menu.bkb.on<string>("projectSelected", "dataFirst", id => this.showProjectWorkspace(id))
    this.settingMenu.bkb.on("createProject", "eventOnly", () => this.showProjectForm())
    this.settingMenu.bkb.on("manageStepTypes", "eventOnly", ev => this.showSettingPanel("stepTypePanel"))
    this.settingMenu.bkb.on("manageContributors", "eventOnly", ev => this.showSettingPanel("contributorPanel"))
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
      let panelInfo = this.panelMap.get("ProjectWorkspace" + ":" + projectId)
      if (panelInfo && panelInfo.type === ProjectWorkspace && panelInfo.panel)
        this.panelContainerEl.removeChild(panelInfo.panel.el)
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
    this.panelMap.set(boardId, {
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
   * @param p the panel to show
   */
  private setCurrentPanel(p: Panel) {
    if (this.currentPanel)
      this.currentPanel.hide()
    this.currentPanel = p
    p.show()
  }

  /**
   * Show the board of a given project.
   *
   * @param projectId the ID of the project which board has to be shown
   */
  private showProjectWorkspace(projectId: string) {
    let panelId = "ProjectWorkspace" + ":" + projectId
    let info = this.panelMap.get(panelId)
    if (!info)
      throw new Error(`Unknown project panel ID: ${projectId} in PanelSelector.`)
    if (!info.panel) {
      info.panel = this.dash.create(ProjectWorkspace, {
        args: [ info.projectModel ]
      })
      this.panelContainerEl.appendChild(info.panel.el)
    }
    this.setCurrentPanel(info.panel)
  }

  /**
   * Show the project form in the PanelSelector.
   *
   * @param project
   */
  private showProjectForm(project?: ProjectModel) {
    this.projectForm.setProject(project)
    this.setCurrentPanel(this.projectForm)
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
   * Display a setting panel.
   * Setting panels are:
   *  - StepTypePanel
   * @param panelId
   */
  private showSettingPanel(panelId: string) {
    let info = this.panelMap.get(panelId)
    if (!info)
      throw new Error(`Unknown settings panel id: ${panelId}`)
    if (!info.panel) {
      if (info.type === StepTypePanel) {
        info.panel = this.dash.create<StepTypePanel>(info.type)
        this.panelContainerEl.appendChild(info.panel.el)
      } else if (info.type === ContributorPanel) {
        info.panel = this.dash.create<ContributorPanel>(info.type)
        this.panelContainerEl.appendChild(info.panel.el)
      } else
        throw new Error(`Unknown Panel type: ${info.type}`)
    }
    this.setCurrentPanel(info.panel)
  }
}

// TODO: remove this...
// The following code has been added for tests purpose.
import * as $ from "jquery"
import { StepModel, StepTypeModel } from "../AppModel/AppModel"

function makeTests(el, model: Model) {
  model.on("change", "dataFirst", data => {
    console.log(`++ event "change"`, data.type, "; ID:", data.id, "; data:", data)
  })
  model.on("update", "dataFirst", data => {
    console.log(`++ event "update"`, data.type, "; ID:", data.id, "; data:", data)
  })
  model.on("updateProject", "dataFirst", data => {
    console.log(`++ event "updateProject"`, data.type, "; ID:", data.id, "; data:", data)
  })
  model.on("createStepType", "dataFirst", data => {
    console.log(`++ event "createStepType"`, data.type, "; ID:", data.id, "; data:", data)
  })

  let type: StepTypeModel
  $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Add type</button>`).appendTo(el).click(async () => {
    let t = await model.exec("create", "StepType", {
      name: "TODO"
    })
    console.log("Created type:", t)
    type = t
  })
  $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Get types</button>`).appendTo(el).click(async () => {
    let types = await model.query("StepType")
    console.log("Loaded types:", types)
  })
  $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Get contributors</button>`).appendTo(el).click(async () => {
    let contributors = await model.query("Contributor")
    console.log("Loaded contributors:", contributors)
  })
  $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Batch</button>`).appendTo(el).click(async () => {
    let batch = model.createCommandBatch();

    batch.query("StepType").then(result => {
      console.log("Queryied steptype:", result)
    })
    batch.query("Project", {archived: false}).then(result => {
      console.log("Queryied Project:", result)
    })

    // batch.exec("delete", "Step", {
    //   id: "3"
    // }).then(result => {
    //   console.log("Deleted step:", result)
    // })
    // batch.exec("create", "Step", {
    //   projectId: "1",
    //   typeId: "2"
    // }).then(step => {
    //   console.log("Created step:", step)
    // })

    let results = await batch.sendAll()
    console.log("Batch result:", results)
  })
  $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Add task</button>`).appendTo(el).click(async () => {
    let step = await model.exec("create", "Task", {
      label: "ABC",
      createdById: "1",
      curStepId: "1",
      parentTaskId: "5"
    })
    console.log("Created step:", step)
  })
  $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Update project</button>`).appendTo(el).click(async () => {
   let project = await model.exec("update", "Project", {
      id: "1",
      description: "Hop la description",
      name: "Beau projet"
    })
    console.log("Updated project:", project, project.tasks)
  })
  $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Reorder types</button>`).appendTo(el).click(async () => {
    await model.reorder("StepType", ["4", "3", "5"])
    console.log("Reordered StepTypes...")
    let types = await model.query("StepType")
    console.log("Ordered types:", types)
  })
}
