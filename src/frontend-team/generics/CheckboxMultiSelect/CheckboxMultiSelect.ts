import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import { removeAllChildren } from "../../../sharedFrontend/libraries/utils";

import template = require("./CheckboxMultiSelect.monk");
import liTemplate = require("./li.monk")

export interface CreateItem<M> {
  (dash: Dash, data: M): { readonly el: HTMLElement }
}

export interface CheckboxMultiSelectOptions<M> {
  title: string
  createItem: CreateItem<M>
}

interface Item<M> {
  data: M
  comp: {
    readonly el: HTMLElement
  }
  listItemEl: HTMLElement
  checkboxEl: HTMLInputElement
}

export class CheckboxMultiSelect<M = any, D extends Dash = Dash> {
  readonly el: HTMLElement
  private olEl: HTMLElement
  private fieldsetEl: HTMLFieldSetElement

  private items = new Map<M, Item<M>>()
  private createSticker: CreateItem<M>

  constructor(private dash: D, { title, createItem }: CheckboxMultiSelectOptions<any>) {
    this.createSticker = createItem

    let view = render(template)
    view.update({ title })
    this.el = view.rootEl()
    this.olEl = view.ref("ol")
    this.fieldsetEl = view.ref("fieldset")
  }

  fillWith(dataList: M[]) {
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

  selectItems(dataList: M[]) {
    let selectSet = new Set(dataList)

    for (let [data, item] of this.items)
      item.checkboxEl.checked = selectSet.has(data)
  }

  /**
   * Notice: the returned list in unordered
   */
  getSelected(): M[] {
    return Array.from(this.items.values()).filter(item => item.checkboxEl.checked).map(item => item.data)
  }

  setEnabled(enabled: boolean) {
    this.fieldsetEl.disabled = !enabled
  }

  // --
  // -- Utilities
  // --

  private createItem(data: M) {
    let view = render(liTemplate)
    let listItemEl = view.rootEl<HTMLElement>()
    let checkboxEl = view.ref<HTMLInputElement>("checkbox")
    let comp = this.createSticker(this.dash, data)
    let item: Item<M> = { listItemEl, checkboxEl, data, comp }

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
