import * as $ from "jquery"
import { Dash } from "bkb"
import TaskBox from "../TaskBox/TaskBox"
import App from "../App/App"
import * as Sortable from "sortablejs"

const boxlistTemplate = require("html-loader!./boxlist.html")
const boxTemplate  = require("html-loader!./box.html")

/**
 * Interface that should implement a Boxlist parameter.
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
  group: string | undefined
  name: string
  obj?: any
  onMove?: (ev: BoxEvent) => boolean
  sort: boolean
}

/**
 * Data object provided by the `boxlistItemAdded` and `boxlistItemRemoved` events.
 */
export interface BoxEvent {
  boxlistId: string
  boxId: string
}

/**
 * Data object provided by the `boxlistUpdated` event.
 */
export interface BoxlistEvent extends BoxEvent {
  boxIds: Array<string>
}

/**
 * Sortable list of items.
 *
 * This component relies on the [Sortable]{@link https://rubaxa.github.io/Sortable/} library to work.
 * A boxlist can emit three events (through the dash):
 *    - boxlistItemAdded => BoxEvent
 *    - boxlistItemRemoved => BoxEvent
 *    - boxlistUpdated => BoxlistEvent
 */
export default class Boxlist<T extends Box> {
  private $container: JQuery
  private $ul: JQuery

  private sortable: Sortable;

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
    $li[0].setAttribute("data-id", box.id)
    box.attachTo($li[0])
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
    this.sortable = Sortable.create(this.$ul[0], {
      handle: ".js-handle",
      group: this.params.group,
      sort: this.params.sort,
      /* Element is dropped into the list from another list. */
      onAdd: (ev) => {
          this.dash.emit("boxlistItemAdded", {
            boxlistId: this.params.id,
            boxId: ev.item.dataset.id
          })
      },
      /* Element is removed from the list into another list. */
      onRemove: (ev) => {
          this.dash.emit("boxlistItemRemoved", {
            boxlistId: this.params.id,
            boxId: ev.item.dataset.id
          })
      },
      /* Changed sorting within list. */
      onUpdate: (ev) => {
        let boxId = ev.item.dataset.id;
        this.dash.emit("boxlistSortingUpdated", {
          boxlistId: this.params.id,
          boxId: ev.item.dataset.id,
          boxIds: this.sortable.toArray()
        })
      },
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
