import { Dash } from "bkb"
import { render } from "monkberry"

const template = require("./Menu.monk")
const liTemplate = require("./li.monk")

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
 * Several items can trigger the same event.
 */
export class Menu {
  readonly el: HTMLElement
  private fieldsetEl: HTMLFieldSetElement
  private ul: HTMLElement

  private items = new Map<string, HTMLElement[]>()

  private view: MonkberryView

  constructor(private dash: Dash) {
    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.fieldsetEl = this.el.querySelector("fieldset") as HTMLFieldSetElement
    this.ul = this.el.querySelector("ul") as HTMLElement
  }

  addItem(item: MenuItem) {
    if (this.items.has(item.id))
      throw new Error(`Item with ID ${item.id} already exists`)

    let view = render(liTemplate, document.createElement("div"))
    let li = view.nodes[0] as HTMLLIElement
    let btn = li.querySelector("button") as HTMLButtonElement
    btn.textContent = item.label
    btn.addEventListener("click", () => this.dash.emit("select", item.id))

    this.ul.appendChild(li)
    this.items.set(item.id, [li, btn])
  }

  addItems(items: MenuItem[]) {
    for (let i of items)
      this.addItem(i)
  }

  removeItem(itemId: string) {
    let arr = this.items.get(itemId)

    if (arr) {
      this.ul.removeChild(arr[0])
      this.items.delete(itemId)
    }
  }

  setItemLabel(id: string, label: string) {
    let arr = this.items.get(id)

    if (!arr)
      throw new Error(`Unkown ID ${id}`)
    arr[1].textContent = label
  }

  enable() {
    this.fieldsetEl.disabled = false
  }

  disable() {
    this.fieldsetEl.disabled = true
  }

  disableItem(itemId: string) {
    let arr = this.items.get(itemId)
    if (arr) {
      let btn = arr[1] as HTMLButtonElement
      btn.disabled = true
    }
  }

  enableItem(itemId: string) {
    let arr = this.items.get(itemId)
    if (arr) {
      let btn = arr[1] as HTMLButtonElement
      btn.disabled = false
    }
  }
}
