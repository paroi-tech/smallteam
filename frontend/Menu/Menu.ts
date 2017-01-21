import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import App from "../App/App"

const template = require("html-loader!./menu.html")

export default class Menu {
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

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public addMenuElement(el: string) {
    this.elements.push(new MenuElement(el))
    let $li = $("<li></li>")
    $li.text(el)
    this.$ul.append($li)
  }
}

class MenuElement {

  constructor(private title: string) {

  }
}