import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Menu, MenuItem } from "../Menu/Menu"
import { DropdownMenu, DropdownMenuItem } from "../DropdownMenu/DropdownMenu"
import ProjectBoard from "../ProjectBoard/ProjectBoard"
import ProjectForm from "../ProjectForm/ProjectForm"
import StepTypePanel from "../StepTypePanel/StepTypePanel"
import Model, { ProjectModel, TaskModel, ModelEvent } from "../Model/Model"

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
  private projectModels: Array<ProjectModel> = []
  private menu: Menu
  private settingMenu: DropdownMenu
  private currentPanel: Panel | null = null

  private projectPanelMap: Map<string, PanelInfo> = new Map<string, PanelInfo>()
  private settingPanelMap: Map<string, PanelInfo> = new Map<string, PanelInfo>()

  private $container: JQuery
  private $menu: JQuery
  private $dropdownMenu: JQuery
  private $panel: JQuery

  constructor(private dash: Dash<App>) {
    this.$container = $(template)
    this.$menu = this.$container.find(".js-menuLeft")
    this.$dropdownMenu = this.$container.find(".js-menuRight")
    this.$panel = this.$container.find(".js-panelContainer")

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

  private initComponents() {
    this.menu = this.dash.create(Menu, {
      args: []
    })
    this.menu.attachTo(this.$menu[0])
    this.menu.bkb.on("projectSelected", "dataFirst", (data: any) => {
      this.showProjectPanel(data.itemId)
    })

    this.settingMenu = this.dash.create(DropdownMenu, { args: [] })
    this.settingMenu.attachTo(this.$dropdownMenu[0])
    this.settingMenu.bkb.on("createProject", "dataFirst", (data: any) => {
      this.showSettingPanel("projectForm")
    })
    this.settingMenu.bkb.on("manageStepTypes", "dataFirst", (data: any) => {
      this.showSettingPanel("stepTypePanel")
    })
    this.settingMenu.addItems(settingMenuItems)
  }

  private listenToEvents() {
    this.dash.listenToChildren("projectCreated").call("dataFirst", (data: any) => {
      let projectModel: ProjectModel = data.projectModel as ProjectModel
      this.addProject(projectModel)
      this.showProjectPanel(projectModel.id)
    })
  }

  private loadProjects() {
    this.dash.app.model.query("Project", {
      archived: false
    })
    .then(projectModels => {
      console.log("queryProjects:", projectModels)
      if (projectModels.length === 0) {
        if (confirm("No project to load from server. Do you want to create a new one ?"))
          this.showSettingPanel("projectForm")
      } else
        for (let model of projectModels)
          this.addProject(model)
    })
    .catch(err => {
      alert("An error occured while loading projects from server.")
    })
  }

  private addProject(model: ProjectModel) {
    this.projectModels.push(model)
    this.projectPanelMap.set(model.id, {
      projectModel: model,
      type: ProjectBoard
    })
    this.menu.addItem({
      id: model.id,
      label: model.code,
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
  $(`<button type="button">Add type</button>`).appendTo(el).click(async () => {
    model.exec("create", "StepType", {
      name: "TODO"
    }).then(t => {
      console.log("Created type:", t)
      type = t
    })
  })
  $(`<button type="button">Get types</button>`).appendTo(el).click(async () => {
    model.query("StepType").then(types => {
      console.log("Loaded types:", types)
    })
  })
  $(`<button type="button">Add step</button>`).appendTo(el).click(async () => {
    model.exec("create", "Step", {
      projectId: "1",
      typeId: "2"
    }).then(step => {
      console.log("Created step:", step)
    })
  })
  $(`<button type="button">Add task</button>`).appendTo(el).click(async () => {
    model.exec("create", "Task", {
      label: "ABC",
      createdById: "1",
      curStepId: "1",
      parentTaskId: "5"
    }).then(step => {
      console.log("Created step:", step)
    })
  })
  $(`<button type="button">Update project</button>`).appendTo(el).click(async () => {
    model.exec("update", "Project", {
      id: "1",
      description: "Hop la description",
      name: "Beau projet"
    }).then(step => {
      console.log("Created step:", step)
    })
  })
}