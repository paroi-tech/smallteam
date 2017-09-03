import * as $ from "jquery"
import { Dash, Bkb, Component } from "bkb"
import App from "../App/App"

const template = require("html-loader!./menu.html")

/**
 * Properties required by the Menu component for its items.
 */
export interface MenuItem {
  id: string
  label: string
  eventName: string
}

/**
 * Footprint of object provided when a menu item is selected.
 */
export interface MenuEvent {
  menuId: string
  itemId: string
}

/**
 * Horizontal menu component.
 *
 * The menu can contain several items. Each item has an ID and an event to emit when clicked.
 * Several items trigger the same event.
 */
export class Menu {
  readonly el: HTMLElement

  private $ul: JQuery
  private itemMap: Map<string, JQuery>

  /**
   * Create a new menu.
   */
  constructor(private dash: Dash<App>, readonly id: string, readonly name: string) {
    this.itemMap = new Map<string, JQuery>()
    let $container = $(template)
    this.$ul = $container.find(".js-ul")
    this.el = $container.get(0)
  }

  /**
   * Add an item to the menu.
   *
   * @param item - the item to add.
   */
  public addItem(item: MenuItem) {
    if (this.itemMap.has(item.id))
      throw new Error(`ID already exists in menu: ${item.id}`)
    let $li = $("<li></li>").appendTo(this.$ul)
    let $btn = $(`<button class="MenuBtn" type="button"></button>`)
      .text(item.label)
      .click((ev) => {
        this.dash.emit(item.eventName, { menuId: this.id, itemId: item.id });
      })
      .appendTo($li)
    this.itemMap.set(item.id, $li)
  }

  /**
   * Add several items to the menu.
   *
   * @param items - items to add.
   */
  public addItems(items: Array<MenuItem>) {
    for (let i of items)
      this.addItem(i)
  }
}
