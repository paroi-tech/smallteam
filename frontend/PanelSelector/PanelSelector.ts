import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import App from "../App/App"
import Menu from "../Menu/Menu"
import ProjectBoard from "../ProjectBoard/ProjectBoard"

const template = require("html-loader!./panelselector.html")

export default class PanelSelector {
  static readonly componentName = "Menu"
  readonly bkb: Bkb

  private menu: Menu;

  private $container: JQuery
  private $menuContainer: JQuery
  private $panelContainer: JQuery

  constructor(private dash: Dash<App>) {
    this.$container = $(template)
    this.$menuContainer = this.$container.find(".js-menu-container")
    this.$panelContainer = this.$container.find(".js-panel-container")
  }

  public init() {
    this.menu = this.dash.create(Menu, { args: [] })
    this.menu.attachTo(this.$menuContainer[0])

    // FIXME Add elements to the menu for tests.
    this.menu.addMenuElement("Project 1")
    this.menu.addMenuElement("Project 2")
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }
}