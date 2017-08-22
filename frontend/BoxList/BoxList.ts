import * as $ from "jquery"
import { Dash } from "bkb"
import TaskBox from "../TaskBox/TaskBox"
import App from "../App/App"
import * as Sortable from "sortablejs"

const boxListTemplate = require("html-loader!./boxlist.html")
const boxTemplate  = require("html-loader!./box.html")

/**
 * As BoxList is a template class, a BoxList instance parameter should implement this interface.
 *
 * The `id` property is required so that the Sortable library can manage the items in a BoxList.
 */
export interface Box {
  id: string
  attachTo(HTMLElement)
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
  boxIds: Array<string>
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
  private $container: JQuery
  private $ul: JQuery
  private sortable: Sortable

  // Map storing boxes of the list.
  private boxMap: Map<string, HTMLElement> = new Map()

  /**
   * Create a new empty BoxList.
   *
   * @param dash - the current application dash
   * @param params - wrapper of the Boxlist parameters
   */
  constructor(private dash: Dash<App>, private params: BoxListParams) {
    this.$container = $(boxListTemplate)
    this.$ul = this.$container.find("ul")
    this.$container.find(".js-title").text(params.name)
    this.makeSortable()
  }

  /**
   * Add a new element to the boxlist.
   *
   * @param box - the element to be added.
   */
  public addBox(box: T) {
    let $li = $(boxTemplate)
    $li.get(0).setAttribute("data-id", box.id)
    box.attachTo($li.get(0))
    $li.appendTo(this.$ul)
    this.boxMap.set(box.id, $li.get(0))
  }

  /**
   * Return the HTML element that represents the BoxList.
   */
  public getRootElement(): HTMLElement {
    return this.$container.get(0)
  }

  /**
   * Remove a box from the list.
   *
   * @param boxId - ID of the box to remove
   */
  public removeBox(boxId: string) {
    let li = this.boxMap.get(boxId)
    if (li)
      this.$ul.get(0).removeChild(li)
  }

  /**
   * Add the BoxList as a child of an HTML element.
   *
   * @param el - element that the BoxList will be added to.
   */
  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  /***
   * Make the boxList sortable by creating a Sortable object.
   */
  private makeSortable() {
    this.sortable = Sortable.create(this.$ul.get(0), {
      handle: ".js-handle",
      group: this.params.group,
      sort: this.params.sort,
      // Element is dropped into the list from another list.
      onAdd: (ev) => {
        this.boxMap.set(ev.item.dataset.id, ev.item)
        this.dash.emit("boxListItemAdded", {
          boxListId: this.params.id,
          boxId: ev.item.dataset.id
        })
      },
      // Element is moved from the list into another list.
      onRemove: (ev) => {
        this.boxMap.delete(ev.item.dataset.id)
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
        if (this.params.obj && this.params.onMove)
          return this.params.onMove.call(this.params.obj, {
            boxId: ev.dragged.dataset.id,
            boxListId: this.params.id
          })
        else
          return true
      }
    })
  }

  /**
   * Change the title (name) of the list.
   *
   * @param title - the new title.
   */
  public setTitle(title: string) {
    this.$container.find(".js-title").text(title)
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
}
