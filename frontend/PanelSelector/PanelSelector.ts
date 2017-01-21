import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import App from "../App/App"
import Menu from "../Menu/Menu"
import ProjectBoard from "../ProjectBoard/ProjectBoard"

const template = require("html-loader!./panelselector.html")

export default class PanelSelector implements Component {
  static readonly componentName = "Menu"
  readonly bkb: Bkb

  private menu: Menu;

  private $container: JQuery
  private $menuContainer: JQuery
  private $panelContainer: JQuery

  constructor(private dash: Dash<App>) {
    this.$container = $(template)
    console.log(this.$container)
    this.$menuContainer = this.$container.find(".js-menu-container")
    this.$panelContainer = this.$container.find(".js-panel-container")
    // We listen to 'createProject' and 'selectProject' events from the dash
     this.dash.listenToChildren("createProject").call("dataFirst", data => {
      console.log("Projectee", JSON.stringify(data))
    })
  }

  public init() {
    this.menu = this.dash.create(Menu, { args: [] })
    this.menu.init()
    this.menu.bkb.on("selectProject", "dataFirst", data => {
      console.log("Project", JSON.stringify(data))
    })
    this.menu.attachTo(this.$menuContainer[0])

    // FIXME Add elements to the menu for tests.
    this.menu.addMenuElement("Project 1")
    this.menu.addMenuElement("Project 2")
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }
}