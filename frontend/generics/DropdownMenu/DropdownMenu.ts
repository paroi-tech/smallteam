import { Dash } from "bkb"
import { render } from "monkberry"
import { MenuItem } from "../Menu/Menu"

const template = require("./DropdownMenu.monk")
const itemTemplate = require("./li.monk")

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
  private btnEl: HTMLElement

  private view: MonkberryView

  private items = new Map<string, HTMLElement[]>()

  private menuVisible = false

 constructor(private dash: Dash, readonly align: Alignment) {
    this.el = this.createView()
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement

    this.ul = el.querySelector(".js-ul") as HTMLElement
    this.ul.style[this.align] = "0"

    this.btnEl = el.querySelector(".js-btn") as HTMLButtonElement
    this.btnEl.addEventListener("click", ev => this.toggle())

    return el
  }

  public addItem(item: MenuItem) {
    if (this.items.has(item.id))
      throw new Error(`Item with ID ${item.id} already exists`)

    let view = render(itemTemplate, document.createElement("div"))
    let li = view.nodes[0] as HTMLLIElement
    let btn = li.querySelector(".js-btn") as HTMLButtonElement

    btn.textContent = item.label
    btn.addEventListener("click", ev => {
      this.toggle()
      this.dash.emit("select", item.id)
    })
    this.items.set(item.id, [li, btn])
    this.ul.appendChild(li)
  }

  public toggle() {
    this.ul.style.display = this.menuVisible ? "none" : "block"
    this.menuVisible = !this.menuVisible
  }

  public addItems(items: MenuItem[]) {
    for (let i of items)
      this.addItem(i)
  }

  public removeItem(itemId: string) {
    let arr = this.items.get(itemId)
    if (arr) {
      this.ul.removeChild(arr[0])
      this.items.delete(itemId)
    }
  }

  public disableItem(itemId: string) {
    let arr = this.items.get(itemId)
    if (arr)
      arr[0].style.pointerEvents = "none"
  }

  public setButtonContent(content: string) {
    this.btnEl.textContent = content
  }

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
