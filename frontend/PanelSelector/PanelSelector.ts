import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Menu, MenuItem } from "../Menu/Menu"
import { DropdownMenu, DropdownMenuItem } from "../DropdownMenu/DropdownMenu"
import ProjectBoard from "../ProjectBoard/ProjectBoard"
import ProjectForm from "../ProjectForm/ProjectForm"
import { ProjectModel, TaskModel } from "../Model/FragmentsModel"
import { createProject, queryProjects } from "../Model/Model"

const template = require("html-loader!./panelselector.html")

export interface Panel {
  attachTo(el: HTMLElement)
  hide()
  show()
}

interface PanelInfo {
  panel?: Panel
  projectModel?: ProjectModel
  type: typeof ProjectBoard | typeof ProjectForm
}

export default class PanelSelector {
  private menu: Menu;
  private dropdownMenu: DropdownMenu

  // TODO: Need Thomas advice about this.
  // We use null as key for the ProjectForm element.
  private map: Map<string | null, PanelInfo>

  private $container: JQuery
  private $menu: JQuery
  private $dropdownMenu: JQuery
  private $panel: JQuery

  constructor(private dash: Dash<App>) {
    this.map = new Map<string, PanelInfo>()

    this.$container = $(template)
    this.$menu = this.$container.find(".js-menu-left")
    this.$dropdownMenu = this.$container.find(".js-menu-right")
    this.$panel = this.$container.find(".js-panel-container")

    this.menu = this.dash.create(Menu, { args: [] })
    this.menu.attachTo(this.$menu[0])
    this.menu.bkb.on("menuItemSelected", "dataFirst", (data: any) => {
      this.showPanel(data.itemId)
    })

    this.dropdownMenu = this.dash.create(DropdownMenu, { args: [] })
    this.dropdownMenu.attachTo(this.$dropdownMenu[0])
    this.dropdownMenu.bkb.on("dropdownMenuItemSelected", "dataFirst", (data: any) => {
      // TODO: Add code here...
    })
    this.dropdownMenu.addItems([
      {
        id: "1",
        label: "New project"
      },
      {
        id: "2",
        label: "Manage steps"
      }
    ])

    this.dash.listenToChildren("projectCreated").call("dataFirst", (data: any) => {
      let projectModel: ProjectModel = data.projectModel as ProjectModel
      this.map.set(projectModel.id, {
        projectModel: projectModel,
        type: ProjectBoard
      })
      this.menu.addItem({
        id: projectModel.id,
        label: projectModel.code
      })
      this.showPanel(projectModel.id)
    })

    this.map.set(null, {
      type: ProjectForm
    })

    this.loadProjects()
  }

  public attachTo(el: HTMLElement) {
    makeTests(el)
    this.$container.appendTo(el)
  }

  private loadProjects() {
    queryProjects({
      archived: false
    }).then(list => {
      console.log("queryProjects:", list)
      if (list.length === 0) {
        alert("No project to load from server.")
        this.showPanel("projectForm")
      } else {
        for (let projectModel of list) {
          this.map.set(projectModel.id, {
            projectModel: projectModel,
            type: ProjectBoard
          })
          this.menu.addItem({
            id: projectModel.id,
            label: projectModel.code
          })
        }
      }
    })
      .catch(err => {
        alert("An error occured while loading projects from server.")
        console.log("Unable to load projects.", err)
      })
  }

  private showPanel(panelId: string) {
    let info = this.map.get(panelId)
    if (!info)
      throw new Error(`Unknown panel id: ${panelId}`)

    // Create a new panel if the PanelInfo does not embed one.
    if (!info.panel) {
      if (info.type == ProjectBoard)
        info.panel = this.dash.create<ProjectBoard>(info.type, {
          args: [info.projectModel]
        })
      else if (info.type == ProjectForm)
        info.panel = this.dash.create<ProjectForm>(info.type, {
          args: []
        })
      else
        throw new Error(`Unknown Panel type: ${info.type}`)

      info.panel.attachTo(this.$panel[0])
    }

    // Hide all panels, except the selected one
    this.map.forEach((v, k, map) => {
      // TODO: Is this test really useful?
      if (!v.panel)
        return
      if (k === panelId)
        v.panel.show()
      else
        v.panel.hide()
    })
  }
}

import { createStep, createStepType, createTask, deleteStep, queryStepTypes, updateProject, updateStepType, updateTask } from "../Model/Model"
import { StepModel, StepTypeModel } from "../Model/FragmentsModel"

function makeTests(el) {
  let type: StepTypeModel
  $(`<button type="button">Add type</button>`).appendTo(el).click(async () => {
    createStepType({
      name: "TODO"
    }).then(t => {
      console.log("Created type:", t)
      type = t
    })
  })
  $(`<button type="button">Get types</button>`).appendTo(el).click(async () => {
    queryStepTypes().then(types => {
      console.log("Loaded types:", types)
    })
  })
  $(`<button type="button">Add step</button>`).appendTo(el).click(async () => {
    createStep({
      projectId: "1",
      typeId: "2"
    }).then(step => {
      console.log("Created step:", step)
    })
  })
  $(`<button type="button">Update project</button>`).appendTo(el).click(async () => {
    updateProject({
      id: "1",
      description: "Hop la description",
      name: "Beau projet"
    }).then(step => {
      console.log("Created step:", step)
    })
  })

}