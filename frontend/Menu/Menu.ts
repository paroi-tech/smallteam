import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"

/**
 * Properties required by the Menu component for its items.
 */
export interface MenuItem {
  id: string
  label: string
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
  private items = new Map<string, HTMLElement[]>()

  /**
   * Create a new menu.
   */
  constructor(private dash: Dash<App>) {
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
    if (this.items.has(item.id))
      throw new Error(`Item with ID ${item.id} already exist`)

    let li = document.createElement("li")
    let btn = document.createElement("button")

    btn.type = "button"
    btn.textContent = item.label
    btn.classList.add("MenuBtn")
    btn.addEventListener("click", (ev) => this.dash.emit("select", item.id))

    li.appendChild(btn)
    this.ul.appendChild(li)
    this.items.set(item.id, [li, btn])
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
    let arr = this.items.get(itemId)
    if (arr) {
      this.ul.removeChild(arr[0])
      this.items.delete(itemId)
    }
  }

  /**
   * Disable an item of the menu.
   *
   * @param itemId - the id of the item to disable.
   */
  public disableItem(itemId: string) {
    let arr = this.items.get(itemId)
    if (arr)
      arr[0].style.pointerEvents = "none"
  }

  /**
   * Enable an item of the menu.
   *
   * @param itemId - the id of the item to enable.
   */
  public enableItem(itemId: string) {
    let arr = this.items.get(itemId)
    if (arr)
      arr[0].style.pointerEvents = "auto"
  }

  public setItemLabel(id: string, label: string) {
    let arr = this.items.get(id)
    if (!arr)
      throw new Error(`Unkown ID ${id}`)
    arr[1].textContent = label
  }
}
