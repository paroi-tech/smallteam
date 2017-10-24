import { Dash } from "bkb"
import * as Sortable from "sortablejs"
import { render } from "monkberry"

import * as boxListTemplate from "./BoxList.monk"
import * as boxTemplate from "./li.monk"
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

  private view: MonkberryView

  private ul: HTMLElement
  private busyIndicatorEl: HTMLElement
  private titleEl: HTMLElement
  private sortable: Sortable

  // Map storing boxes of the list.
  private boxes = new Map<string, HTMLElement>()

  /**
   * Create a new empty BoxList.
   *
   * @param dash - the current application dash
   * @param params - wrapper of the Boxlist parameters
   */
  constructor(private dash: Dash, private params: BoxListParams) {
    this.view = render(boxListTemplate, document.createElement("div"))
    this. el = this.view.nodes[0] as HTMLElement

    this.ul = this.el.querySelector("ul") as HTMLElement
    this.busyIndicatorEl = this.el.querySelector(".js-busy-icon") as HTMLElement
    this.titleEl = this.el.querySelector(".js-title") as HTMLElement

    this.setTitle(this.params.name)
    this.makeSortable()
  }

  /**
   * Add a new element to the boxlist.
   *
   * @param box - the element to be added.
   */
  public addBox(box: T) {
    let view = render(boxTemplate, document.createElement("div"))
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

  private createCloseItem(): HTMLElement {
    let view = render(closeTemplate, document.createElement("div"))
    let el = view.nodes[0] as HTMLElement

    return el
  }

  /**
   * Indicate if the BoxList contains an element with a given ID.
   * @param id
   */
  public hasBox(id: string) {
    return this.boxes.has(id)
  }

  /**
   * Remove a box from the list.
   *
   * @param boxId - ID of the box to remove
   */
  public removeBox(boxId: string) {
    let li = this.boxes.get(boxId)
    if (li) {
      this.ul.removeChild(li)
      this.boxes.delete(boxId)
    }
  }

  /**
   * Remove all elements from the BoxList.
   */
  public clear() {
    Array.from(this.boxes.keys()).forEach(key => this.removeBox(key))
  }

  /***
   * Make the boxList sortable by creating a Sortable object.
   */
  private makeSortable() {
    this.sortable = Sortable.create(this.ul, {
      handle: ".js-handle",
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

  /**
   * Change the title of the list.
   *
   * @param title - the new title.
   */
  public setTitle(title: string) {
    this.titleEl.textContent = title
  }

  /**
   * Sort the elements in the boxlist.
   *
   * @param order - array of ids which will be used to sort the boxlist.
   * @see {@link https://github.com/RubaXa/Sortable#sortorderstring}
   */
  public setBoxesOrder(order: string[]) {
    this.sortable.sort(order)
  }

  /**
   * Return the IDs of the BoxList elements, based on their current order.
   */
  public getBoxesOrder(): string[] {
    return this.sortable.toArray()
  }

  /**
   * Enable ou disable the BoxList.
   *
   * If the component is disabled, it does not react to user actions.
   * Code based on the answer by Kokodoko at:
   * @url{https://stackoverflow.com/questions/639815/how-to-disable-all-div-content}
   *
   * @param b If `true`, the BoxList is enabled else the BoxList is disabled
   */
  public setEnabled(b: boolean) {
    this.el.style.pointerEvents = b ? "auto" : "none"
    this.el.style.opacity = b ? "1.0" : "0.4"
  }

  /**
   * Enable the component.
   *
   * @param showBusyIcon Indicate if the busy icon should be hidden
   */
  public enable(showBusyIcon: boolean = false) {
    this.el.style.pointerEvents = this.el.style.pointerEvents = "auto"
    this.el.style.opacity = "1.0"
    if (showBusyIcon)
      this.hideBusyIcon()
  }

  /**
   * Disable the component.
   *
   * @param showBusyIcon Indicate if the busy should be shown
   */
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

  public showBusyIcon() {
    this.busyIndicatorEl.style.display = "inline"
  }

  public hideBusyIcon() {
    this.busyIndicatorEl.style.display = "none"
  }
}
