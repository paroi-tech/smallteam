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

  private ul: HTMLElement
  private itemMap: Map<string, HTMLElement> = new Map()

  /**
   * Create a new menu.
   */
  constructor(private dash: Dash<App>, readonly id: string, readonly name: string) {
    this.el = document.createElement("nav")
    this.el.classList.add("Menu")
    this.ul = document.createElement("ul")
    this.ul.classList.add("Menu-ul")
    this.el.appendChild(this.ul)
  }

  /**
   * Add an item to the menu.
   *
   * @param item - the item to add.
   */
  public addItem(item: MenuItem) {
    if (this.itemMap.has(item.id))
      throw new Error(`ID already exists in menu: ${item.id}`)
    let li = document.createElement("li")
    let btn = document.createElement("button")
    btn.type = "button"
    btn.textContent = item.label
    btn.classList.add("MenuBtn")
    btn.addEventListener("click", (ev) => this.dash.emit(item.eventName, {
        menuId: this.id,
        itemId: item.id
      })
    )
    li.appendChild(btn)
    this.ul.appendChild(li)
    this.itemMap.set(item.id, li)
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
