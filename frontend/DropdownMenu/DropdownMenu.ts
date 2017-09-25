import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { MenuItem } from "../Menu/Menu"

const template = require("html-loader!./dropdownmenu.html")
const itemTemplate = require("html-loader!./element.html")

export type Alignment = "left" | "right"

/**
 * Dropdown menu component.
 *
 * It is made by a button and a list of clickable items shown when the button is clicked.
 * Each item in the menu has an ID and an event emited when clicked.
 */
export class DropdownMenu {
  readonly el: HTMLElement
  private ul: HTMLElement

  private items = new Map<string, HTMLElement[]>()

  private menuVisible = false

  /**
   * Create a new dropdown menu.
   */
  constructor(private dash: Dash<App>, readonly align: Alignment) {
    this.el = this.createHtmlElements()
  }

  /**
   * Create menu content from the template.
   */
  private createHtmlElements(): HTMLElement {
    let $container = $(template)
    this.ul = $container.find(".js-ul").get(0)
    this.ul.style[this.align] = "0"
    $container.find(".js-btn").get(0).addEventListener("click", ev => this.toggle())
    return $container.get(0)
  }

  /**
   * Add an item to the menu.
   *
   * @param item - the item to add.
   */
  public addItem(item: MenuItem) {
    if (this.items.has(item.id))
      throw new Error(`Item with ID ${item.id} already exists`)

    let li = $(itemTemplate).get(0)
    let btn = li.querySelector(".js-btn") as HTMLButtonElement

    btn.textContent = item.label
    btn.addEventListener("click", ev => {
      this.toggle()
      this.dash.emit("select", item.id)
    })
    this.items.set(item.id, [li, btn])
    this.ul.appendChild(li)
  }

  /**
   * Toggle the dropdown menu.
   */
  public toggle() {
    this.ul.style.display = this.menuVisible ? "none" : "block"
    this.menuVisible = !this.menuVisible
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
