import { Dash } from "bkb"
import * as Sortable from "sortablejs"
import { render } from "monkberry"

import * as boxListTemplate from "./BoxList.monk"
import * as liTemplate from "./li.monk"
import * as inlineLiTemplate from "./InlineLi.monk"
import * as closeTemplate from "./ItemRemove.monk"

/**
 * As BoxList is a template class, a BoxList instance parameter should implement this interface.
 *
 * The `id` property is required so that the Sortable library can manage the items in a BoxList.
 */
export interface Box {
  id: string
  el: HTMLElement
}

/**
 * BoxList constructor parameters grouped in an interface.
 */
export interface BoxListParams {
  // BoxList ID.
  id: string
  // The Sortable lib enables to create groups, so that we can move items (drag and drop) between lists
  // that belong to the same group. This attribute represents the group of the Boxlist.
  group: string | undefined
  // Name of the BoxList.
  name: string
  // When an item is moved inside a list or between lists, this function is used to validate or cancel
  // the move.
  onMove?: (ev: BoxEvent) => boolean
  // Object on which the 'onMove' function is called.
  obj?: any
  // Is the BoxList disabled?
  disabled?: boolean
  // Add a remove button beside each element in the BoxList.
  itemRemoveButton?: boolean
  // Is this an InlineBoxlist?
  inline: boolean | undefined
  // Can items be reordered within the BoxList?
  sort: boolean
}

/**
 * Object provided by the `boxListItemAdded` and `boxListItemRemoved` events.
 */
export interface BoxEvent {
  boxListId: string
  boxId: string // ID of the moved item
}

/**
 * Object provided by the `boxlistUpdated` event.
 */
export interface BoxListEvent extends BoxEvent {
  // Array of string that contains the IDs of the items in the BoxList. The order of the IDs is the same as
  // the order of the items in the BoxList.
  boxIds: string[]
}

/**
 * Sortable list of items.
 *
 * This component relies on the [Sortable]{@link https://rubaxa.github.io/Sortable/} library to work.
 * A BoxList can emit three events (through the dash):
 *    - boxListItemAdded, when an item id dropped in the BoxList => BoxEvent
 *    - boxListItemRemoved, when an item is moved (dragged) from the BoxList => BoxEvent
 *    - boxListUpdated, when the order of the items in the Boxlist is updated => BoxListEvent
 */
export default class BoxList<T extends Box> {
  readonly el: HTMLElement
  private ul: HTMLElement
  private busyIndicatorEl: HTMLElement
  private titleEl: HTMLElement
  private sortable: Sortable

  private view: MonkberryView

  // Map storing boxes of the list.
  private boxes = new Map<string, HTMLElement>()

  constructor(private dash: Dash, private params: BoxListParams) {
    this.el = this.createView()
    this.setTitle(this.params.name)
    this.makeSortable()
  }

  public addBox(box: T) {
    let tpl = this.params.inline ? inlineLiTemplate : liTemplate
    let view = render(tpl, document.createElement("div"))
    let li = view.nodes[0] as HTMLLIElement

    li.setAttribute("data-id", box.id)
    li.appendChild(box.el)

    if (this.params.itemRemoveButton) {
      let el = this.createCloseItem()
      let span = el.querySelector("span") as HTMLElement

      span.addEventListener("click", ev => {
        this.dash.emit("boxListItemRemoveRequested", {
          boxListId: this.params.id,
          boxId: box.id
        })
      })
      li.addEventListener("mouseover", ev => span.style.visibility = "visible")
      li.addEventListener("mouseleave", ev => span.style.visibility = "hidden")
      li.appendChild(el)
    }

    this.ul.appendChild(li)
    this.boxes.set(box.id, li)
  }

  public hasBox(id: string) {
    return this.boxes.has(id)
  }

  public removeBox(boxId: string) {
    let li = this.boxes.get(boxId)
    if (li) {
      this.ul.removeChild(li)
      this.boxes.delete(boxId)
    }
  }

  public clear() {
    Array.from(this.boxes.keys()).forEach(key => this.removeBox(key))
  }

  public setTitle(title: string) {
    this.titleEl.textContent = title
  }

  /**
   * Sort the elements in the boxlist.
   *
   * @param order - array of ids which will be used to sort the boxlist.
   * @see {@link https://github.com/RubaXa/Sortable#sortorderstring}
   */
  public sort(order: string[]) {
    this.sortable.sort(order)
  }

  /**
   * Return the IDs of the BoxList elements, based on their current order.
   */
  public getOrder(): string[] {
    return this.sortable.toArray()
  }

  public enable(showBusyIcon: boolean = false) {
    this.el.style.pointerEvents = this.el.style.pointerEvents = "auto"
    this.el.style.opacity = "1.0"
    if (showBusyIcon)
      this.hideBusyIcon()
  }

  public disable(showBusyIcon: boolean = false) {
    this.el.style.pointerEvents = this.el.style.pointerEvents = "none"
    this.el.style.opacity = "0.4"
    if (showBusyIcon)
      this.showBusyIcon()
  }

  /**
   * Enable the sorting capabilities of the BoxList.
   *
   * Note: calling this method will have effect only if the `sort` member of the BoxList constructor
   *       was set to true.
   * @param hideIcon - Indicate if the busy icon should be hidden
   */
  public enableSort(hideBusyIcon: boolean = false) {
    if (this.params.sort && this.sortable.option("disabled")) {
      this.sortable.option("disabled", false)
      if (hideBusyIcon)
        this.hideBusyIcon()
    }
  }

  /**
   * Disable the sorting capabilities of the BoxList.
   *
   * Note: calling this method will have effect only if the `sort` member of the BoxList constructor
   *       param was set to true.
   * @param showIcon - Indicate if the busy icon should be displayed
   */
  public disableSort(showBusyIcon: boolean = false) {
    if (this.params.sort && !this.sortable.option("disabled")) {
      this.sortable.option("disabled", true)
      if (showBusyIcon)
        this.showBusyIcon()
    }
  }

  // --
  // -- Utilities
  // --

  private createView() {
    this.view = render(boxListTemplate, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement
    this.ul = el.querySelector("ul") as HTMLElement
    this.busyIndicatorEl = el.querySelector(".js-busy-icon") as HTMLElement
    this.titleEl = el.querySelector(".js-title") as HTMLElement

    if (this.params.inline)
      el.classList.add("InlineBoxList")

    return el
  }

  private createCloseItem(): HTMLElement {
    let view = render(closeTemplate, document.createElement("div"))
    let el = view.nodes[0] as HTMLElement

    return el
  }

  /***
   * Make the boxList sortable by creating a Sortable object.
   */
  private makeSortable() {
    this.sortable = Sortable.create(this.ul, {
      // For InlineBoxList, we do not need a handle.
      handle: this.params.inline ? undefined : ".js-handle",

      group: this.params.group,
      sort: this.params.sort,
      disabled: this.params.disabled === undefined ? false : this.params.disabled,

      // Element is dropped into the list from another list.
      onAdd: (ev) => {
        this.boxes.set(ev.item.dataset.id, ev.item)
        this.dash.emit("boxListItemAdded", {
          boxListId: this.params.id,
          boxId: ev.item.dataset.id
        })
      },

      // Element is moved from the list into another list.
      onRemove: (ev) => {
        this.boxes.delete(ev.item.dataset.id)
        this.dash.emit("boxListItemRemoved", {
          boxListId: this.params.id,
          boxId: ev.item.dataset.id
        })
      },

      // Changed sorting within list.
      onUpdate: (ev) => {
        let boxId = ev.item.dataset.id
        this.dash.emit("boxListSortingUpdated", {
          boxListId: this.params.id,
          boxId: ev.item.dataset.id,
          boxIds: this.sortable.toArray()
        })
      },

      // Event when an item is moved inside a list ot between lists.
      onMove: (ev, originalEv) => {
        if (this.params.obj && this.params.onMove) {
          return this.params.onMove.call(this.params.obj, {
            boxId: ev.dragged.dataset.id,
            boxListId: this.params.id
          })
        } else
          return true
      }
    })
  }

  private showBusyIcon() {
    this.busyIndicatorEl.style.display = "inline"
  }

  private hideBusyIcon() {
    this.busyIndicatorEl.style.display = "none"
  }
}
