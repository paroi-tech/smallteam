import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import App from "../App/App"

const template = require("html-loader!./menu.html")

export default class Menu implements Component {
  static readonly componentName = "Menu"
  readonly bkb: Bkb

  private $container: JQuery
  private $ul: JQuery

  private elements: Array<MenuElement>

  constructor(private dash: Dash<App>, id: string, title: string) {
    this.$container = $(template)
    this.$ul = this.$container.find(".js-ul")

    this.elements = []
  }

  public init() {
    this.$container.find(".js-btn").click(() => {
      console.log("Add project button clicked...")
      this.dash.emit("createProject")
    })
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public addMenuElement(elementName: string) {
    this.elements.push(new MenuElement(elementName))
    let $li = $("<li></li>")
    $li.text(elementName)
    $li.click((ev) => {
      console.log(`Click on project ${elementName}`)
      this.dash.emit("selectProject", { project: elementName });
    })
    this.$ul.append($li)
  }
}

class MenuElement {

  constructor(private title: string) {

  }
}