import { Dash } from "bkb"
import Sortable = require("sortablejs")
import { render } from "@fabtom/lt-monkberry"

const boxListTemplate = require("./BoxList.monk")
const liTemplate = require("./li.monk")
const inlineLiTemplate = require("./InlineLi.monk")

export interface Box {
  id: string
  el: HTMLElement
}

export interface BoxListOptions {
  /**
   * BoxList ID.
   */
  id: string

  /**
   * Sortable enables to create groups, so that we can move items between lists that belong to the same group.
   */
  group: string | undefined

  /**
   * Name of the BoxList.
   */
  name: string

  /**
   * When an item is moved inside a list or between lists, this function is used to validate or cancel the move.
   */
  onMove?: (ev: BoxEvent) => boolean

  /**
   * Object on which the 'onMove' function is called.
   */
  obj?: any

  /**
   * Is the BoxList disabled?
   */
  disabled?: boolean

  /**
   * Is this an InlineBoxlist?
   */
  inline: boolean | undefined

  /**
   * Can items be reordered within the BoxList?
   */
  sort: boolean
}

export interface BoxEvent {
  boxListId: string
  boxId: string
}

export interface BoxListEvent extends BoxEvent {
  /**
   * IDs of the BoxList items.
   * The order of the IDs is the same as the order of the items in the BoxList.
   */
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
  private ulEl: HTMLElement
  private busyIndicatorEl: HTMLElement
  private titleEl: HTMLElement
  private sortable: Sortable

  private boxes = new Map<string, HTMLElement>()

  constructor(private dash: Dash, private options: BoxListOptions) {
    let view = render(boxListTemplate)
    this.el = view.rootEl()

    this.ulEl = view.ref("ul")
    this.busyIndicatorEl = view.ref("busyIcon")
    this.titleEl = view.ref("title")
    if (this.options.inline)
      this.el.classList.add("InlineBoxList")

    this.setTitle(this.options.name)
    this.sortable = this.makeSortable()
  }

  public addBox(box: T) {
    let tpl = this.options.inline ? inlineLiTemplate : liTemplate
    let view = render(tpl)
    let li: HTMLElement = view.rootEl()

    li.setAttribute("data-id", box.id)

    if (this.options.inline)
      li.appendChild(box.el)
    else
      view.ref("content").appendChild(box.el)

    this.ulEl.appendChild(li)
    this.boxes.set(box.id, li)
  }

  public hasBox(id: string) {
    return this.boxes.has(id)
  }

  public removeBox(boxId: string) {
    let liElt = this.boxes.get(boxId)
    if (!liElt)
      return false
    this.ulEl.removeChild(liElt)
    this.boxes.delete(boxId)
    return true
  }

  public clear() {
    for (let key of this.boxes.keys())
      this.removeBox(key)
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

  public enable(hideBusyIcon: boolean = false) {
    this.el.style.pointerEvents = this.el.style.pointerEvents = "auto"
    this.el.style.opacity = "1.0"
    if (hideBusyIcon)
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
    if (this.options.sort && this.sortable.option("disabled")) {
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
    if (this.options.sort && !this.sortable.option("disabled")) {
      this.sortable.option("disabled", true)
      if (showBusyIcon)
        this.showBusyIcon()
    }
  }

  // --
  // -- Utilities
  // --

  private makeSortable() {
    return Sortable.create(this.ulEl, {
      filter: "button",
      group: this.options.group,
      sort: this.options.sort,
      disabled: this.options.disabled ? true : false,

      // Element is dropped into the list from another list.
      onAdd: (ev) => {
        this.boxes.set(ev.item.dataset.id, ev.item)
        this.dash.emit("boxListItemAdded", {
          boxListId: this.options.id,
          boxId: ev.item.dataset.id
        })
      },

      // Element is moved from the list into another list.
      onRemove: (ev) => {
        this.boxes.delete(ev.item.dataset.id)
        this.dash.emit("boxListItemRemoved", {
          boxListId: this.options.id,
          boxId: ev.item.dataset.id
        })
      },

      // Changed sorting within list.
      onUpdate: (ev) => {
        this.dash.emit("boxListSortingUpdated", {
          boxListId: this.options.id,
          boxId: ev.item.dataset.id,
          boxIds: this.sortable.toArray()
        })
      },

      // Event when an item is moved inside a list ot between lists.
      onMove: ev => {
        if (!this.options.obj || !this.options.onMove)
          return true
        return this.options.onMove.call(this.options.obj, {
          boxId: ev.dragged.dataset.id,
          boxListId: this.options.id
        })
      }
    })
  }

  private showBusyIcon() {
    this.busyIndicatorEl.hidden = false
  }

  private hideBusyIcon() {
    this.busyIndicatorEl.hidden = true
  }
}