import { Dash } from "bkb"
import { render } from "monkberry"
import { removeAllChildren } from "../../libraries/utils";

const template = require("./CheckboxMultiSelect.monk")
const liTemplate = require("./li.monk")

export interface CreateComponentForItem<M> {
  (dash: Dash, data: M): { readonly el: HTMLElement }
}

interface Item<M> {
  data: M
  comp: { readonly el: HTMLElement }
  liEl: HTMLElement
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
      this.olEl.appendChild(item.liEl)
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
    // this.el.style.pointerEvents = enabled ? "auto" : "none"
    this.fieldsetEl.disabled = !enabled
  }

  private createItem(data: M) {
    let view = render(liTemplate, document.createElement("div"))
    let liEl = view.nodes[0] as HTMLLIElement
    let checkboxEl = liEl.querySelector(".js-checkbox") as HTMLInputElement

    let comp = this.createComponentForItem(this.dash, data)
    liEl.appendChild(comp.el)
    this.olEl.appendChild(liEl)

    let item = { liEl, checkboxEl, data, comp }
    this.items.set(data, item)
    return item
  }

  private removeItem(item: Item<M>) {
    if (item.liEl.parentElement === this.olEl)
      this.olEl.removeChild(item.liEl)
    this.dash.getPublicDashOf(item.comp).destroy()
    this.items.delete(item.data)
  }

  private createView(title: string): HTMLElement {
    this.view = render(template, document.createElement("div"))
    this.view.update({ title })
    let el = this.view.nodes[0] as HTMLElement
    this.olEl = el.querySelector(".js-ol") as HTMLElement
    this.fieldsetEl = el.querySelector("fieldset") as HTMLFieldSetElement
    return el
  }

  // private listenToModel() {
  //   // Listen to flag creation event.
  //   this.dash.listenTo<UpdateModelEvent>(this.model, "createFlag").onData(data => {
  //     this.addItemFor(data.model as FlagModel)
  //   })

  //   // Listen to flag deletion event in order to remove corresponding item from the selector.
  //   // IMPORTANT: What happens to orderNums where a flag is deleted ?
  //   this.dash.listenTo<UpdateModelEvent>(this.model, "deleteFlag").onData(data => {
  //     let flagId = data.id as string
  //     let li = this.items.get(flagId)
  //     if (li)
  //       this.olEl.removeChild(li)
  //     this.checkboxes.delete(flagId)
  //   })

  //   // Listen to flag reorder event.
  //   this.dash.listenTo<ReorderModelEvent>(this.model, "reorder").onData(data => {
  //     if (data.type !== "Flag")
  //       return
  //     let flagIds = data.orderedIds as string[]
  //     flagIds.forEach(flagId => {
  //       let el = this.items.get(flagId)
  //       if (el)
  //         this.olEl.appendChild(el)
  //     })
  //   })
  // }
}

