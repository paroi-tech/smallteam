import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import App from "../App/App"
import Menu from "../Menu/Menu"
import ProjectBoard from "../ProjectBoard/ProjectBoard"
import ProjectForm from "../ProjectForm/ProjectForm"

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
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public init(): PanelSelector {
    this.menu = this.dash.create(Menu, { args: [] }).init()
    this.menu.bkb.on("menuEntrySelected", "dataFirst", (data: any) => {
        this.showPanel(data.entryId? data.entryId: "projectForm")
    })
    this.menu.attachTo(this.$menuContainer[0])

    // FIXME: Add elements to the menu for tests.
    this.map.set(`prj-${"123"}`, {
      projectId: "123",
      type: ProjectBoard
    })
    this.menu.addMenuEntry(`prj-${"123"}`, "Project 1")
    this.map.set(`prj-${"456"}`, {
      projectId: "456",
      type: ProjectBoard
    })
    this.menu.addMenuEntry(`prj-${"456"}`, "Project 2")
    // Project Form
    this.map.set("projectForm", {
      projectId: "projectForm",
      type: ProjectForm
    })

    return this;
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