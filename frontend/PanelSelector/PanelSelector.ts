import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import App from "../App/App"
import Menu from "../Menu/Menu"
import ProjectBoard from "../ProjectBoard/ProjectBoard"
import ProjectForm from "../ProjectForm/ProjectForm"
import { createProject, queryProjects } from "../Model/Model"
import { ProjectModel, TaskModel } from "../Model/FragmentsModel"

const template = require("html-loader!./panelselector.html")

export interface Panel {
  attachTo(el: HTMLElement)
  show()
  hide()
}

interface PanelInfo {
  type: typeof ProjectBoard | typeof ProjectForm
  projectId?: string
  panel?: Panel
}

export default class PanelSelector implements Component {
  static readonly componentName = "PanelSelector"
  readonly bkb: Bkb

  private menu: Menu;
  private map: Map<string, PanelInfo>

  private $container: JQuery
  private $menuContainer: JQuery
  private $panelContainer: JQuery

  constructor(private dash: Dash<App>) {
    this.map = new Map<string, PanelInfo>()
    this.$container = $(template)
    this.$menuContainer = this.$container.find(".js-menu-container")
    this.$panelContainer = this.$container.find(".js-panel-container")
    this.$container.find(".js-test1").click(() => {
      createProject({
        code: "ABC123yy",
        name: "Hello, World!"
      }).then(project => console.log("createProject:", project, project.rootTask))
      .catch(err => console.log(err))
    })
    this.$container.find(".js-test2").click(() => {
      queryProjects({
        archived: false
      }).then(list => console.log("queryProjects:", list))
      .catch(err => console.log(err))
    })
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public init(): PanelSelector {
    this.menu = this.dash.create(Menu, { args: [] }).init()
    this.menu.attachTo(this.$menuContainer[0])
    this.menu.bkb.on("menuEntrySelected", "dataFirst", (data: any) => {
        this.showPanel(data.entryId? data.entryId: "ProjectForm")
    })

    this.dash.on("projectCreated", "dataFirst", (data: any) => {
      let projectModel: ProjectModel = data.projectModel as ProjectModel
      this.map.set(projectModel.id, {
        projectId: projectModel.id,
        type: ProjectBoard
      })
      this.menu.addMenuEntry(projectModel.id, projectModel.code)
      this.showPanel(projectModel.id)
    })

    this.loadProjects()
    // Add a ProjectForm to the PanelSelector.
    this.map.set("ProjectForm", {
      projectId: "ProjectForm",
      type: ProjectForm
    })

    return this;
  }

  private loadProjects() {
    queryProjects({
        archived: false
      }).then(list => {
        console.log("queryProjects:", list)
        if(list.length === 0) {
          alert("No project to load from server.")
          this.showPanel("projectForm")
        } else {
          for(let projectModel of list) {
            this.map.set(projectModel.id, {
              projectId: projectModel.id,
              type: ProjectBoard
            })
            this.menu.addMenuEntry(projectModel.id, projectModel.code)
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

    if (!info.panel) {
      if (info.type == ProjectBoard)
        info.panel = this.dash.create<ProjectBoard>(info.type, {
          args: [info.projectId, panelId]
        }).init()
      else if (info.type == ProjectForm)
        info.panel = this.dash.create<ProjectForm>(info.type, {
          args: []
        })
      else
        throw new Error(`Unknown Panel type: ${info.type}`)

      info.panel.attachTo(this.$panelContainer[0])
    }

    // Hide all panels, except the selected one
    this.map.forEach((v, k, map) => {
      if (!v.panel)
        return
      if (k === panelId)
        v.panel.show()
      else
        v.panel.hide()
    })
  }
}