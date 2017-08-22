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
  readonly bkb: Bkb

  private $container: JQuery
  private $ul: JQuery

  private itemMap: Map<string, JQuery>

  /**
   * Create a new menu.
   */
  constructor(private dash: Dash<App>, readonly id: string, readonly name: string) {
    this.itemMap = new Map<string, JQuery>()
    this.$container = $(template)
    this.$ul = this.$container.find(".js-ul")
  }

  /**
   * Add an item to the menu.
   *
   * @param item - the item to add.
   */
  public addItem(item: MenuItem) {
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

  /**
   * Add the menu to an container.
   *
   * @param el - element that the box will be added to.
   */
  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }
}
