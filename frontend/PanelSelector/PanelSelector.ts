import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Menu, MenuItem, MenuEvent } from "../Menu/Menu"
import { DropdownMenu } from "../DropdownMenu/DropdownMenu"
import ProjectBoard from "../ProjectBoard/ProjectBoard"
import ProjectForm from "../ProjectForm/ProjectForm"
import StepTypePanel from "../StepTypePanel/StepTypePanel"
import { Model, ProjectModel, TaskModel } from "../Model/Model"
import ProjectStepsPanel from "../ProjectForm/ProjectStepsPanel/ProjectStepsPanel"

const template = require("html-loader!./panelselector.html")

/**
 * Properties required for an Component in order to be displayed in PanelSelector.
 */
export interface Panel {
  attachTo(el: HTMLElement)
  hide()
  show()
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
  private model: Model
  private projects: ProjectModel[]
  private menu: Menu
  private settingMenu: DropdownMenu
  private currentPanel: Panel | undefined

  private panelMap: Map<string, PanelInfo> = new Map()

  private $container: JQuery
  private $menu: JQuery
  private $dropdownMenu: JQuery
  private $panelContainer: JQuery

  constructor(private dash: Dash<App>) {
    this.model = dash.app.model

    this.initJQueryObjects()
    this.initComponents()
    this.listenToEvents()

    this.loadProjects()
  }

  private initJQueryObjects() {
    this.$container = $(template)
    this.$menu = this.$container.find(".js-menuLeft")
    this.$dropdownMenu = this.$container.find(".js-menuRight")
    this.$panelContainer = this.$container.find(".js-panelContainer")
  }

  private initComponents() {
    this.menu = this.dash.create(Menu, {
      args: ["1", "Panel selector projects menu"]
    })
    this.menu.attachTo(this.$menu.get(0))

    this.settingMenu = this.dash.create(DropdownMenu, {
      args: ["2", "Panel selector dropdown menu"]
    })
    this.settingMenu.attachTo(this.$dropdownMenu.get(0))
    this.settingMenu.addItems(settingMenuItems)

    // We have to do this, or else the project board won't be able to display the step type panel later.
    // See the PanelSelector#showSettingPanel() for details.
    this.panelMap.set("stepTypePanel", {
      type: StepTypePanel,
    })
  }

  private listenToEvents() {
    this.model.on("createProject", "dataFirst", data => this.addProject(data.model))
    this.dash.listenToChildren<ProjectModel>("editProject").call("dataFirst", project => this.showProjectForm(project))
    this.menu.bkb.on<MenuEvent>("projectSelected", "dataFirst", (ev) => this.showProjectBoard(ev.itemId))
    this.settingMenu.bkb.on<MenuEvent>("createProject", "dataFirst", () => this.showProjectForm())
    this.settingMenu.bkb.on<MenuEvent>("manageStepTypes", "dataFirst", () => this.showSettingPanel("stepTypePanel"))
  }

  public attachTo(el: HTMLElement) {
    this.$container.appendTo(el)
    // FIXME:  Remove this line.
    makeTests(el, this.dash.app.model)
  }

  private loadProjects() {
    this.model.query("Project", {
      archived: false
    }).then(projects => {
      console.log("Loaded projects:", projects)
      this.projects = projects
      if (projects.length === 0) {
        if (confirm("No project to load from server. Do you want to create a new one?"))
          this.showProjectForm()
      } else
        for (let p of projects)
          this.addProject(p)
    }).catch(err => {
      console.error("An error occured while loading projects from server.", err)
    })
  }

  private addProject(project: ProjectModel) {
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

  private setCurrentPanel(p: Panel) {
    if (this.currentPanel)
      this.currentPanel.hide()
    this.currentPanel = p
    p.show()
  }

  private showProjectBoard(projectId: string) {
    let panelId = "ProjectBoard" + ":" + projectId
    let info = this.panelMap.get(panelId)
    if (!info)
      throw new Error(`Unknown project panel ID: ${projectId}`)
    if (!info.panel) {
      info.panel = this.dash.create(ProjectBoard, {
        args: [ info.projectModel ]
      })
      info.panel.attachTo(this.$panelContainer.get(0))
    }
    this.setCurrentPanel(info.panel)
  }

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
        form.attachTo(this.$panelContainer.get(0))
        info.panel = form
      }
      this.setCurrentPanel(info.panel)
    } else {
      let form = this.dash.create(ProjectForm, {
        args: [ this ]
      })
      form.attachTo(this.$panelContainer.get(0))
      this.setCurrentPanel(form)
    }
  }

  public linkFormToProject(form: ProjectForm, project: ProjectModel) {
    let info: PanelInfo = {
      panel: form,
      projectModel: project,
      type: ProjectForm
    }
    let formId = "ProjectForm" + ":" + project.id
    this.panelMap.set(formId, info)
  }

  private showSettingPanel(panelId: string) {
    let info = this.panelMap.get(panelId)
    if (!info)
      throw new Error(`Unknown settings panel id: ${panelId}`)
    if (!info.panel) {
      if (info.type == StepTypePanel)
        info.panel = this.dash.create<StepTypePanel>(info.type, { args: [] })
      else
        throw new Error(`Unknown Panel type: ${info.type}`)
      info.panel.attachTo(this.$panelContainer.get(0))
    }
    this.setCurrentPanel(info.panel)
  }
}

// TODO: remove this...
// The following code has been added for tests purpose.
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
