import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Menu, MenuItem, MenuEvent } from "../Menu/Menu"
import { DropdownMenu } from "../DropdownMenu/DropdownMenu"
import ProjectBoard from "../ProjectBoard/ProjectBoard"
import ProjectForm from "../ProjectForm/ProjectForm"
import StepTypePanel from "../StepTypePanel/StepTypePanel"
import { Model, ProjectModel, TaskModel, ModelEvent } from "../Model/Model"
import ProjectStepsPanel from "../ProjectForm/ProjectStepsPanel/ProjectStepsPanel"

const template = require("html-loader!./panelselector.html")

export interface Panel {
  attachTo(el: HTMLElement)
  hide()
  show()
}

interface PanelInfo {
  panel?: Panel
  projectModel?: ProjectModel
  type: typeof ProjectBoard | typeof ProjectForm | typeof StepTypePanel
}

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

  private projectPanelMap: Map<string, PanelInfo> = new Map()
  private settingPanelMap: Map<string, PanelInfo> = new Map()

  private $container: JQuery
  private $menu: JQuery
  private $dropdownMenu: JQuery
  private $panel: JQuery

  constructor(private dash: Dash<App>) {
    this.model = dash.app.model

    this.initJQueryObjects()
    this.initComponents()
    this.listenToEvents()

    this.settingPanelMap.set("projectForm", { type: ProjectForm })
    this.settingPanelMap.set("stepTypePanel", { type: StepTypePanel })
    this.loadProjects()
  }

  public attachTo(el: HTMLElement) {
    makeTests(el, this.dash.app.model)
    this.$container.appendTo(el)
  }

  private initJQueryObjects() {
    this.$container = $(template)
    this.$menu = this.$container.find(".js-menuLeft")
    this.$dropdownMenu = this.$container.find(".js-menuRight")
    this.$panel = this.$container.find(".js-panelContainer")
  }

  private initComponents() {
    this.menu = this.dash.create(Menu, {
      args: ["1", "Panel selector projects menu"]
    })
    this.menu.attachTo(this.$menu[0])

    this.settingMenu = this.dash.create(DropdownMenu, {
      args: ["2", "Panel selector dropdown menu"]
    })
    this.settingMenu.attachTo(this.$dropdownMenu[0])
    this.settingMenu.addItems(settingMenuItems)
  }

  private listenToEvents() {
    this.model.on("createProject", "dataFirst", data => {
      this.addProject(data.model)
      this.showProjectPanel(data.model.id)
    })

    this.dash.listenToChildren<ProjectModel>("editProject").call("dataFirst", project => {
      console.log("event intercepted...")
      this.showProjectForm(project)
    })

    this.menu.bkb.on<MenuEvent>("projectSelected", "dataFirst", (ev) => {
      this.showProjectPanel(ev.itemId)
    })

    this.settingMenu.bkb.on<MenuEvent>("createProject", "dataFirst", () => {
      this.showSettingPanel("projectForm")
    })
    this.settingMenu.bkb.on<MenuEvent>("manageStepTypes", "dataFirst", () => {
      this.showSettingPanel("stepTypePanel")
    })
  }

  private loadProjects() {
    this.dash.app.model.query("Project", {
      archived: false
    })
      .then(projects => {
        console.log("Loaded projects:", projects)
        this.projects = projects
        if (projects.length === 0) {
          if (confirm("No project to load from server. Do you want to create a new one?"))
            this.showSettingPanel("projectForm")
        } else
          for (let p of projects)
            this.addProject(p)
      })
      .catch(err => {
        console.error("An error occured while loading projects from server.", err)
      })
  }

  private addProject(project: ProjectModel) {
    this.projectPanelMap.set(project.id, {
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

  private showProjectPanel(panelId: string) {
    let info = this.projectPanelMap.get(panelId)
    if (!info)
      throw new Error(`Unknown project panel id: ${panelId}`)

    if (!info.panel) {
      info.panel = this.dash.create(ProjectBoard, {
        args: [info.projectModel]
      })
      info.panel.attachTo(this.$panel[0])
    }

    this.setCurrentPanel(info.panel)
  }

  private showProjectForm(project: ProjectModel) {
    let info = this.settingPanelMap.get("projectForm")
    if (!info)
      throw new Error("Unknown settings panel id: projectForm")
    if (!info.panel) {
      info.panel = this.dash.create(ProjectForm, { args: [] })
      info.panel.attachTo(this.$panel[0])
    }
    if (this.currentPanel) {
      this.currentPanel.hide()
    }
    (info.panel as ProjectForm).show(project)
    this.currentPanel = info.panel
  }

  private showSettingPanel(panelId: string) {
    let info = this.settingPanelMap.get(panelId)
    if (!info)
      throw new Error(`Unknown settings panel id: ${panelId}`)

    if (!info.panel) {
      if (info.type == ProjectForm)
        info.panel = this.dash.create<ProjectForm>(info.type, { args: [] })
      else if (info.type == StepTypePanel)
        info.panel = this.dash.create<StepTypePanel>(info.type, { args: [] })
      else
        throw new Error(`Unknown Panel type: ${info.type}`)
      info.panel.attachTo(this.$panel[0])
    }
    this.setCurrentPanel(info.panel)
  }
}

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
    model.exec("create", "StepType", {
      name: "TODO"
    }).then(t => {
      console.log("Created type:", t)
      type = t
    })
  })
  $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Get types</button>`).appendTo(el).click(async () => {
    model.query("StepType").then(types => {
      console.log("Loaded types:", types)
    })
  })
  $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Batch</button>`).appendTo(el).click(async () => {
    //let projects = await model.query("Project", {});
    let batch = model.createCommandBatch();
    batch.exec("delete", "Step", {
      id: "3"
    }).then(result => {
      console.log("Delete step:", result)
    })
    batch.exec("create", "Step", {
      projectId: "1",
      typeId: "2"
    }).then(step => {
      console.log("Created step:", step)
    })
    batch.sendAll().then(results => {
      console.log("Batch result:", results)
    })
  })
  $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Add task</button>`).appendTo(el).click(async () => {
    model.exec("create", "Task", {
      label: "ABC",
      createdById: "1",
      curStepId: "1",
      parentTaskId: "5"
    }).then(step => {
      console.log("Created step:", step)
    })
  })
  $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Update project</button>`).appendTo(el).click(async () => {
    model.exec("update", "Project", {
      id: "1",
      description: "Hop la description",
      name: "Beau projet"
    }).then(step => {
      console.log("Created step:", step)
    })
  })
  $(`<button type="button" style="background: #F0F0F0; padding: 2px; margin: 2px">Reorder types</button>`).appendTo(el).click(async () => {
    model.reorder("StepType", ["4", "3", "5"]).then(() => {
      console.log("Reordered StepTypes...")
      model.query("StepType").then(types => {
        console.log("Ordered types:", types)
      })
    })
  })
}