import * as $ from "jquery"
import { Dash } from "bkb"
import TaskBox from "../TaskBox/TaskBox"
import App from "../App/App"
import * as Sortable from "sortablejs"

const boxlistTemplate = require("html-loader!./boxlist.html")
const boxTemplate  = require("html-loader!./box.html")

/**
 * As Boxlist is a template class, a Boxlist instance parameter should implement this interface.
 *
 * The `id` property is required so that the Sortable library can manage the items in a Boxlist.
 */
export interface Box {
  id: string
  attachTo(HTMLElement)
}

/**
 * Boxlist constructor parameters grouped in an interface.
 */
export interface BoxlistParams {
  id: string
  // The Sortable lib enables to create groups, so that we can move items (drag and drop) between lists
  // that belong to the same group. This attribute represents the group of the Boxlist.
  group: string | undefined
  // Name of the Boxlist.
  name: string
  // When an item is moved inside a list or between lists, this function is used to validate or cancel
  // the move.
  onMove?: (ev: BoxEvent) => boolean
  // Object on which the 'onMove' function is called.
  obj?: any
  // Can items be reordered within the Boxlist?
  sort: boolean
}

/**
 * Object provided by the `boxlistItemAdded` and `boxlistItemRemoved` events.
 */
export interface BoxEvent {
  boxlistId: string
  boxId: string // ID of the moved item
}

/**
 * Object provided by the `boxlistUpdated` event.
 */
export interface BoxlistEvent extends BoxEvent {
  // Array of string that contains the IDs of the items in the Boxlist. The order of the IDs is the same as
  // the order of the items in the Boxlist.
  boxIds: Array<string>
}

/**
 * Sortable list of items.
 *
 * This component relies on the [Sortable]{@link https://rubaxa.github.io/Sortable/} library to work.
 * A boxlist can emit three events (through the dash):
 *    - boxlistItemAdded, when an item id dropped in the Boxlist => BoxEvent
 *    - boxlistItemRemoved, when an item is moved (dragged) from the Boxlist => BoxEvent
 *    - boxlistUpdated, when the order of the itms in the Boxlist is updated => BoxlistEvent
 */
export default class Boxlist<T extends Box> {
  private $container: JQuery
  private $ul: JQuery
  private sortable: Sortable

  /**
   * Create a new empty Boxlist.
   *
   * @param dash - the current application dash
   * @param params - wrapper of the Boxlist parameters
   */
  constructor(private dash: Dash<App>, private params: BoxlistParams) {
    this.$container = $(boxlistTemplate)
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
  }

  /**
   * Add the boxlist as a child of an HTML element.
   *
   * @param el - element that the boxlist will be added to.
   */
  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  /***
   * Make the boxlist sortable by creating a Sortable object.
   */
  private makeSortable() {
    this.sortable = Sortable.create(this.$ul.get(0), {
      handle: ".js-handle",
      group: this.params.group,
      sort: this.params.sort,
      // Element is dropped into the list from another list.
      onAdd: (ev) => {
          this.dash.emit("boxlistItemAdded", {
            boxlistId: this.params.id,
            boxId: ev.item.dataset.id
          })
      },
      // Element is moved from the list into another list.
      onRemove: (ev) => {
          this.dash.emit("boxlistItemRemoved", {
            boxlistId: this.params.id,
            boxId: ev.item.dataset.id
          })
      },
      // Changed sorting within list.
      onUpdate: (ev) => {
        let boxId = ev.item.dataset.id
        this.dash.emit("boxlistSortingUpdated", {
          boxlistId: this.params.id,
          boxId: ev.item.dataset.id,
          boxIds: this.sortable.toArray()
        })
      },
      // Event when an item is moved inside a list ot between lists.
      onMove: (ev, originalEv) => {
        if (this.params.obj && this.params.onMove)
          return this.params.onMove.call(this.params.obj, {
            boxId: ev.dragged.dataset.id,
            boxlistId: this.params.id
          })
        else
          return true
      }
    })
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

  public getBoxesOrder(): string[] {
    return this.sortable.toArray()
  }
}
