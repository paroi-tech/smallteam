import { Dash } from "bkb"
import { render } from "monkberry"
import { removeAllChildren } from "../../libraries/utils"

const template = require("./CheckboxMultiSelect.monk")
const liTemplate = require("./li.monk")

export interface CreateComponentForItem<M> {
  (dash: Dash, data: M): { readonly el: HTMLElement }
}

interface Item<M> {
  data: M
  comp: {
    readonly el: HTMLElement
  }
  listItemEl: HTMLElement
  checkboxEl: HTMLInputElement
}

export default class CheckboxMultiSelect<M> {
  readonly el: HTMLElement
  private olEl: HTMLElement
  private fieldsetEl: HTMLFieldSetElement

  private view: MonkberryView

  private items = new Map<M, Item<M>>()

  constructor(private dash: Dash, title: string, private createComponentForItem: CreateComponentForItem<M>) {
    this.el = this.createView(title)
  }

  public setAllItems(dataList: M[]) {
    let dataSet = new Set(dataList)

    Array.from(this.items.values())
      .filter(item => !dataSet.has(item.data))
      .forEach(item => this.removeItem(item))
    removeAllChildren(this.olEl)

    for (let data of dataList) {
      let item = this.items.get(data)
      if (!item)
        item = this.createItem(data)
      this.olEl.appendChild(item.listItemEl)
    }
  }

  public selectItems(dataList: M[]) {
    let selectSet = new Set(dataList)

    for (let [data, item] of this.items)
      item.checkboxEl.checked = selectSet.has(data)
  }

  /**
   * Notice: the returned list in unordered
   */
  public getSelected(): M[] {
    return Array.from(this.items.values()).filter(item => item.checkboxEl.checked).map(item => item.data)
  }

  public setEnabled(enabled: boolean) {
    this.fieldsetEl.disabled = !enabled
  }

  // --
  // -- Utilities
  // --

  private createView(title: string): HTMLElement {
    this.view = render(template, document.createElement("div"))
    this.view.update({ title })

    let el = this.view.nodes[0] as HTMLElement

    this.olEl = el.querySelector(".js-ol") as HTMLElement
    this.fieldsetEl = el.querySelector("fieldset") as HTMLFieldSetElement

    return el
  }

  private createItem(data: M) {
    let view = render(liTemplate, document.createElement("div"))
    let listItemEl = view.nodes[0] as HTMLLIElement
    let checkboxEl = listItemEl.querySelector(".js-checkbox") as HTMLInputElement
    let comp = this.createComponentForItem(this.dash, data)
    let item = { listItemEl, checkboxEl, data, comp }

    listItemEl.appendChild(comp.el)
    this.olEl.appendChild(listItemEl)
    this.items.set(data, item)

    return item
  }

  private removeItem(item: Item<M>) {
    if (item.listItemEl.parentElement === this.olEl)
      this.olEl.removeChild(item.listItemEl)
    this.dash.getPublicDashOf(item.comp).destroy()
    this.items.delete(item.data)
  }


}
