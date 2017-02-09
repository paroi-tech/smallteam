import * as $ from "jquery"
import { Dash, Bkb, Component } from "bkb"
import App from "../App/App"

const template = require("html-loader!./menu.html")

export interface MenuItem {
  id: string,
  label: string
  eventName: string
}

export class Menu {
  readonly bkb: Bkb

  private $container: JQuery
  private $ul: JQuery

  private elements: Map<string, JQuery>

  constructor(private dash: Dash<App>, id: string, title: string) {
    this.elements = new Map<string, JQuery>()

    this.$container = $(template)
    this.$ul = this.$container.find(".js-ul")
  }

  public addItem(item: MenuItem) {
    let $li = $("<li></li>")
    $li.text(item.label)
    $li.click((ev) => {
      console.log(`Click on menu item ${item.label}`)
      this.dash.emit(item.eventName, { itemId: item.id });
    })
    this.$ul.append($li)
    this.elements.set(item.id, $li)
  }

  public addItems(items: Array<MenuItem>) {
    for (let i of items)
      this.addItem(i)
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }
}