require("./_MultiSelect.scss")
import { Dash } from "bkb"
import handledom from "handledom"
import { removeAllChildren } from "../../../../shared-ui/libraries/utils"

const template = handledom`
<section class="MultiSelect">
  <h1 class="MultiSelect-h1">{{ title }}</h1>
  <fieldset h="fieldset">
    <ol class="MultiSelect-ol" h="ol"></ol>
  </fieldset>
</section>
`

const liTemplate = handledom`
<li>
  <input class="MultiSelect-input" h="checkbox" type="checkbox">
  <div class="MultiSelect-itemContent"></div>
</li>
`

export type CreateItem<M> = (data: M) => { readonly el: HTMLElement }

export interface MultiSelectOptions<M> {
  title: string
  createItem: CreateItem<M>
}

export interface ChangeEvent<M> {
  type: string
  data: M
  checked: boolean
}

interface Item<M> {
  data: M
  comp: {
    readonly el: HTMLElement
  }
  listItemEl: HTMLElement
  checkboxEl: HTMLInputElement
}

export default class MultiSelect<M = any> {
  readonly el: HTMLElement

  private olEl: HTMLElement
  private fieldsetEl: HTMLFieldSetElement
  private createSticker: CreateItem<M>
  private items = new Map<M, Item<M>>()
  private checkboxes = new WeakMap<HTMLInputElement, Item<M>>()

  constructor(private dash: Dash, { title, createItem }: MultiSelectOptions<any>) {
    this.createSticker = createItem

    const { root, ref } = template({ title })
    this.el = root
    this.olEl = ref("ol")
    this.fieldsetEl = ref("fieldset")

    this.olEl.addEventListener("change", ev => {
      let item = this.checkboxes.get(ev.target as any)
      if (item) {
        this.dash.emit("change", {
          type: "Flag",
          data: item.data,
          checked: (ev.target as HTMLInputElement).checked
        } as ChangeEvent<M>)
      }
    })

    dash.listenTo("destroy", () => {
      for (let item of this.items.values())
        this.dash.getPublicDashOf(item.comp).destroy()
    })
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
    const { root, ref } = liTemplate()
    let listItemEl = root
    let checkboxEl = ref<HTMLInputElement>("checkbox")
    let comp = this.createSticker(data)
    let item: Item<M> = { listItemEl, checkboxEl, data, comp }

    listItemEl.appendChild(comp.el)
    this.olEl.appendChild(listItemEl)
    this.items.set(data, item)
    this.checkboxes.set(checkboxEl, item)

    return item
  }

  private removeItem(item: Item<M>) {
    if (item.listItemEl.parentElement === this.olEl)
      this.olEl.removeChild(item.listItemEl)
    this.dash.getPublicDashOf(item.comp).destroy()
    this.items.delete(item.data)
    this.checkboxes.delete(item.checkboxEl)
  }
}
