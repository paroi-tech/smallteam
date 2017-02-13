import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Menu, MenuItem } from "../Menu/Menu"
import { DropdownMenu, DropdownMenuItem } from "../DropdownMenu/DropdownMenu"
import ProjectBoard from "../ProjectBoard/ProjectBoard"
import ProjectForm from "../ProjectForm/ProjectForm"
import StepTypePanel from "../StepTypePanel/StepTypePanel"
import { ProjectModel, TaskModel } from "../Model/FragmentsModel"
import { query } from "../Model/Model"

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

export default class PanelSelector {
  private menu: Menu;
  private settingMenu: DropdownMenu
  private currentPanel: Panel | null = null

  private projectPanels: Map<string, PanelInfo> = new Map<string, PanelInfo>()
  private settingPanels: Map<string, PanelInfo> = new Map<string, PanelInfo>()

  private $container: JQuery
  private $menu: JQuery
  private $dropdownMenu: JQuery
  private $panel: JQuery

  constructor(private dash: Dash<App>) {
    this.$container = $(template)
    this.$menu = this.$container.find(".js-menu-left")
    this.$dropdownMenu = this.$container.find(".js-menu-right")
    this.$panel = this.$container.find(".js-panel-container")

    this.menu = this.dash.create(Menu, { args: [] })
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

    // TODO: This is for tests only. Add elements to dropdown menu
    this.settingMenu.addItems([
      {
        id: "1",
        label: "New project",
        eventName: "createProject"
      },
      {
        id: "2",
        label: "Manage step types",
        eventName: "manageStepTypes"
      }
    ])

    this.dash.listenToChildren("projectCreated").call("dataFirst", (data: any) => {
      let projectModel: ProjectModel = data.projectModel as ProjectModel
      this.projectPanels.set(projectModel.id, {
        projectModel: projectModel,
        type: ProjectBoard
      })
      this.menu.addItem({
        id: projectModel.id,
        label: projectModel.code,
        eventName: "projectSelected"
      })
      this.showProjectPanel(projectModel.id)
    })

    this.settingPanels.set("projectForm", {
      type: ProjectForm
    })

    this.settingPanels.set("stepTypePanel", {
      type: StepTypePanel
    })

    this.loadProjects()
  }

  public attachTo(el: HTMLElement) {
    makeTests(el)
    this.$container.appendTo(el)
  }

  private loadProjects() {
    query("Project", {
      archived: false
    }).then(list => {
      console.log("queryProjects:", list)
      if (list.length === 0) {
        if (confirm("No project to load from server. Do you want to create a new one ?"))
          this.showSettingPanel("projectForm")
      } else {
        for (let projectModel of list) {
          this.projectPanels.set(projectModel.id, {
            projectModel: projectModel,
            type: ProjectBoard
          })
          this.menu.addItem({
            id: projectModel.id,
            label: projectModel.code,
            eventName: "projectSelected"
          })
        }
      }
    }).catch(err => {
      alert("An error occured while loading projects from server.")
      console.log("Unable to load projects.", err)
    })
  }

  private setCurrentPanel(p: Panel) {
    if (this.currentPanel)
      this.currentPanel.hide()
    this.currentPanel = p
    p.show()
  }

  private showProjectPanel(panelId: string) {
    let info = this.projectPanels.get(panelId)
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
    let info = this.settingPanels.get(panelId)
    if (!info)
      throw new Error(`Unknown settings panel id: ${panelId}`)

    // Create a new panel if the PanelInfo does not embed one.
    if (!info.panel) {
      if (info.type == ProjectForm)
        info.panel = this.dash.create<ProjectForm>(info.type, {
          args: []
        })
      else if (info.type == StepTypePanel)
        info.panel = this.dash.create<StepTypePanel>(info.type, {
          args: []
        })
      else
        throw new Error(`Unknown Panel type: ${info.type}`)

      info.panel.attachTo(this.$panel[0])
    }

    this.setCurrentPanel(info.panel)
  }

}

import { exec } from "../Model/Model"
import { StepModel, StepTypeModel } from "../Model/FragmentsModel"

function makeTests(el) {
  let type: StepTypeModel
  $(`<button type="button">Add type</button>`).appendTo(el).click(async () => {
    exec("create", "StepType", {
      name: "TODO"
    }).then(t => {
      console.log("Created type:", t)
      type = t
    })
  })
  $(`<button type="button">Get types</button>`).appendTo(el).click(async () => {
    query("StepType").then(types => {
      console.log("Loaded types:", types)
    })
  })
  $(`<button type="button">Add step</button>`).appendTo(el).click(async () => {
    exec("create", "Step", {
      projectId: "1",
      typeId: "2"
    }).then(step => {
      console.log("Created step:", step)
    })
  })
  $(`<button type="button">Add task</button>`).appendTo(el).click(async () => {
    exec("create", "Task", {
      label: "ABC",
      createdById: "1",
      curStepId: "1",
      parentTaskId: "1"
    }).then(step => {
      console.log("Created step:", step)
    })
  })
  $(`<button type="button">Update project</button>`).appendTo(el).click(async () => {
    exec("update", "Project", {
      id: "1",
      description: "Hop la description",
      name: "Beau projet"
    }).then(step => {
      console.log("Created step:", step)
    })
  })

}