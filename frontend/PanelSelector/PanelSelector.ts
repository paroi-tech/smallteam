import { Dash, Bkb, Component } from "bkb"
import App from "../App/App"
import { Menu, MenuItem, MenuEvent } from "../Menu/Menu"
import { DropdownMenu } from "../DropdownMenu/DropdownMenu"
import ProjectBoard from "../ProjectBoard/ProjectBoard"
import ProjectForm from "../ProjectForm/ProjectForm"
import StepTypePanel from "../StepTypePanel/StepTypePanel"
import { Model, ProjectModel, TaskModel } from "../Model/Model"
import ProjectStepsPanel from "../ProjectForm/ProjectStepsPanel/ProjectStepsPanel"
import { render } from "monkberry"
import * as template from "./panelselector.monk"

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
 * Several types of components are displayed in the PanelSelector.
 *
 * We store data about components currently displayed in the PanelSelector. For now, we plan to display
 * three types of component in the PanelSelector:
 *    - ProjectBoard
 *    - ProjectForm
 *    - StepsTypePanel
 */
interface PanelInfo {
  panel?: Panel
  projectModel?: ProjectModel
  type: typeof ProjectBoard | typeof ProjectForm | typeof StepTypePanel
}

/**
 * Options displayed in the dropdown menu of the PanelSelector.
 */
const settingMenuItems = [
  { id: "1", label: "New project", eventName: "createProject" },
  { id: "2", label: "Manage step types", eventName: "manageStepTypes" }
]

export default class PanelSelector {
  readonly el: HTMLElement

  private model: Model
  private menu: Component<Menu>
  private settingMenu: Component<DropdownMenu>
  private currentPanel: Panel | undefined

  private panelMap: Map<string, PanelInfo> = new Map()

  private view: MonkberryView

  private menuEl: HTMLElement
  private dropdownMenuEl: HTMLElement
  private panelContainerEl: HTMLElement

  private projectMap: Map<string, ProjectModel> = new Map()

  /**
   * Create a nex PanelSelector.
   *
   * @param dash
   */
  constructor(private dash: Dash<App>) {
    this.model = dash.app.model
    this.el = this.initView()
    this.initSubComponents()
    this.listenToModel()
    this.listenToEvents()
    this.loadProjects()
    makeTests(this.el, this.dash.app.model) // TODO:  Remove this line
  }

  private initView() {
    let wrapperEl = document.createElement("div")
    this.view = render(template, wrapperEl)

    this.menuEl = this.view.querySelector(".js-menuLeft")
    this.dropdownMenuEl = this.view.querySelector(".js-menuRight")
    this.panelContainerEl = this.view.querySelector(".js-panelContainer")

    return wrapperEl
  }

  // /**
  //  * Create PanelSelector elements from template.
  //  */
  // private initJQueryObjects() {
  //   let $container = $(template)
  //   this.menuEl = $container.find(".js-menuLeft")[0]
  //   this.dropdownMenuEl = $container.find(".js-menuRight")[0]
  //   this.panelContainerEl = $container.find(".js-panelContainer")[0]
  //   return $container.get(0)
  // }

  /**
   * Create PanelSelector subcomponents.
   */
  private initSubComponents() {
    this.menu = this.dash.create(Menu, {
      args: ["PanelSelectorMenu", "Project selection menu"]
    })
    this.menuEl.appendChild(this.menu.el)

    this.settingMenu = this.dash.create(DropdownMenu, {
      args: ["PanelSelectorDropdownMenu", "Global settings menu", "right"]
    })
    this.dropdownMenuEl.appendChild(this.settingMenu.el)
    this.settingMenu.addItems(settingMenuItems)

    // We have to do this, or else the project board won't be able to display the step type panel later.
    // See the PanelSelector#showSettingPanel() for details.
    this.panelMap.set("stepTypePanel", { type: StepTypePanel })
  }

  /**
   * Listen to event from child components.
   */
  private listenToEvents() {
    this.dash.listenToChildren<ProjectModel>("editProject").call("dataFirst", project => {
      this.showProjectForm(project)
    })
    this.menu.bkb.on<MenuEvent>("projectSelected", "dataFirst", data => this.showProjectBoard(data.itemId))
    this.settingMenu.bkb.on("createProject", "dataFirst", () => this.showProjectForm())
    this.settingMenu.bkb.on("manageStepTypes", "dataFirst", () => {
      this.showSettingPanel("stepTypePanel")
    })
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
      let panelInfo = this.panelMap.get("ProjectBoard" + ":" + projectId)
      if (panelInfo && panelInfo.type === ProjectBoard && panelInfo.panel)
        this.panelContainerEl.removeChild(panelInfo.panel.el)
      this.menu.removeItem(projectId)
    })
  }

  /**
   * Load projects from model and request the creation of ProjectBoard for each of the projects.
   */
  private async loadProjects() {
    try {
      let projects = await this.model.query("Project", {
        archived: false
      })
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
    let boardId = "ProjectBoard" + ":" + project.id
    this.panelMap.set(boardId, {
      projectModel: project,
      type: ProjectBoard
    })
    this.menu.addItem({
      id: project.id,
      label: project.code,
      eventName: "projectSelected"
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
  private showProjectBoard(projectId: string) {
    let panelId = "ProjectBoard" + ":" + projectId
    let info = this.panelMap.get(panelId)
    if (!info)
      throw new Error(`Unknown project panel ID: ${projectId} in PanelSelector.`)
    if (!info.panel) {
      info.panel = this.dash.create(ProjectBoard, {
        args: [ info.projectModel ]
      })
      this.panelContainerEl.appendChild(info.panel.el)
    }
    this.setCurrentPanel(info.panel)
  }

  /**
   * Show a project form in the PanelSelector.
   *
   * @param project the project which form should be displayed. If `undefined` a blak for is displayed.
   */
  private showProjectForm(project?: ProjectModel) {
    if (project) {
      let formId = "ProjecForm" + ":" + project.id
      let info = this.panelMap.get(formId)
      if (!info) {
        info = { type: ProjectBoard, projectModel: project }
        this.panelMap.set(formId, info)
      }
      if (!info.panel) {
        let form = this.dash.create(ProjectForm, { args: [ this, project ] })
        this.panelContainerEl.appendChild(form.el)
        info.panel = form
      }
      this.setCurrentPanel(info.panel)
    } else {
      let form = this.dash.create(ProjectForm, {
        args: [ this ]
      })
      this.panelContainerEl.appendChild(form.el)
      this.setCurrentPanel(form)
    }
  }

  /**
   * Inform the PanelSelector to use a ProjectForm for a given project.
   * This function is necessary since ProjectForms are not created for a specific project. So after a
   * ProjectForm was used to create a project, it has to prevent its PanelSelector that it is now linked to
   * a project.
   *
   * @param form
   * @param project
   */
  public linkFormToProject(form: ProjectForm, project: ProjectModel) {
    let info: PanelInfo = {
      panel: form,
      projectModel: project,
      type: ProjectForm
    }
    let formId = "ProjectForm" + ":" + project.id
    this.panelMap.set(formId, info)
  }

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
      } else
        throw new Error(`Unknown Panel type: ${info.type}`)
    }
    this.setCurrentPanel(info.panel)
  }
}

// TODO: remove this...
// The following code has been added for tests purpose.
import * as $ from "jquery"
import { StepModel, StepTypeModel } from "../Model/Model"

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
