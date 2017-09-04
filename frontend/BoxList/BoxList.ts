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
  readonly el: HTMLElement

  private $title: JQuery
  private $ul: JQuery
  private $busyIcon: JQuery
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
    let $container = $(boxListTemplate)
    // TODO: move the two following lines in a `disable` method.
    // https://stackoverflow.com/questions/639815/how-to-disable-all-div-content (solution by Kokodoko)
    // this.$container.css("pointer-events", "none")
    // this.$container.css("opacity", "0.4")
    this.$ul = $container.find("ul")
    this.$busyIcon = $container.find(".js-busy-icon")
    this.$title = $container.find(".js-title").text(params.name)
    this.makeSortable()
    this.el = $container.get(0)
  }

  /**
   * Add a new element to the boxlist.
   *
   * @param box - the element to be added.
   */
  public addBox(box: T) {
    let $li = $(boxTemplate)
    $li.get(0).setAttribute("data-id", box.id)
    $li.append(box.el)
    $li.appendTo(this.$ul)
    this.boxMap.set(box.id, $li.get(0))
  }

  /**
   * Indicate if the BoxList contains an element with a given ID.
   * @param id
   */
  public hasBox(id: string) {
    return this.boxMap.has(id)
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

  /***
   * Make the boxList sortable by creating a Sortable object.
   */
  private makeSortable() {
    this.sortable = Sortable.create(this.$ul.get(0), {
      disabled: this.params.sort ? false : true,
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
    this.$title.find(".js-title").text(title)
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
   *
   * @param b If `true`, the BoxList is enabled else the BoxList is disabled
   */
  public setEnabled(b: boolean) {
    this.el.style.pointerEvents = b ? "auto" : "none"
    this.el.style.opacity = b ? "0" : "0.4"
  }

  /**
   * Enable the component.
   *
   * @param showBusyIcon Indicate if the busy icon should be hidden
   */
  public enable(showBusyIcon: boolean = false) {
    this.el.style.pointerEvents = this.el.style.pointerEvents = "auto"
    this.el.style.opacity = "0"
    if (showBusyIcon)
      this.hideBusyIcon()
  }

  /**
   * Disable the component.
   *
   * @param showBusyIcon Indicate if the busy should be shown
   */
  public disable(showBusyIcon: boolean = false) {
    this.el.style.pointerEvents = this.el.style.pointerEvents = "nonr"
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

  /**
   * Show the Busy indicator.
   */
  public showBusyIcon() {
    this.$busyIcon.show()
  }

  /**
   * Hide the busy indicator.
   */
  public hideBusyIcon() {
    this.$busyIcon.hide()
  }
}
