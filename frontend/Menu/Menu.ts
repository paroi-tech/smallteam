import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { render } from "monkberry"

import * as template from "./menu.monk"
import * as itemTemplate from "./item.monk"

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

  private view: MonkberryView

  /**
   * Create a new menu.
   */
  constructor(private dash: Dash<App>) {
    this.el = this.createView()
  }

  private createView() {
    this.view = render(template, document.createElement("div"))
    let el = this.view.nodes[0] as HTMLElement
    this.ul = el.querySelector("ul") as HTMLElement

    return el
  }

  /**
   * Add an item to the menu.
   *
   * @param item - the item to add.
   */
  public addItem(item: MenuItem) {
    if (this.items.has(item.id))
      throw new Error(`Item with ID ${item.id} already exists`)

    let view = render(itemTemplate, document.createElement("div"))
    let li = view.nodes[0] as HTMLLIElement
    let btn = li.querySelector("button") as HTMLButtonElement

    btn.textContent = item.label
    btn.addEventListener("click", (ev) => this.dash.emit("select", item.id))

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
