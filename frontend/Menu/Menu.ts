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
  data: any
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
  constructor(private dash: Dash<App>, readonly name: string) {
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
      throw new Error(`Item with ID ${item.id} already exists in ${this.name}`)
    let li = document.createElement("li")
    let btn = document.createElement("button")
    btn.type = "button"
    btn.textContent = item.label
    btn.classList.add("MenuBtn")
    btn.addEventListener("click", (ev) => this.dash.emit(item.eventName, item.data))
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

  /**
   * Remove an item from the menu.
   *
   * @param itemId
   */
  public removeItem(itemId: string) {
    let itemEl = this.itemMap.get(itemId)
    if (itemEl) {
      this.ul.removeChild(itemEl)
      this.itemMap.delete(itemId)
    }
  }

  /**
   * Disable an item of the menu.
   *
   * @param itemId - the id of the item to disable.
   */
  public disableItem(itemId: string) {
    let item = this.itemMap.get(itemId)
    if (item)
      item.style.pointerEvents = "none"
  }

  /**
   * Enable an item of the menu.
   *
   * @param itemId - the id of the item to enable.
   */
  public enableItem(itemId: string) {
    let item = this.itemMap.get(itemId)
    if (item)
      item.style.pointerEvents = "auto"
  }
}
