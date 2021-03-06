import { Dash } from "bkb"
import handledom from "handledom"
import Sortable from "sortablejs"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
@import "../shared-ui/theme/definitions";

.BoxList {
  &-header {
    // align-items: baseline;
    color: #000;
    border-bottom: 1px solid $themeColor;
    // display: flex;
    // flex-direction: row;
    font-weight: bold;
    // justify-content: space-between;
    padding: 8px 0px 5px;
  }

  &-ul {
    min-height: 50px;
    /* We add a bottom padding so that elements can easily be dragged at the end of the BoxList. */
    padding-bottom: 50px;
  }

  &-li {
    margin-bottom: 5px;
  }

  &-inlineLi {
    align-items: center;
    display: flex;
    justify-content: space-between;
    min-height: 30px;
    padding: 5px;
    vertical-align: middle;
  }

  &-spinner {
    height: 16px;
    width: 16px;
  }

  &.inline &-ul {
    align-content: space-between;
    display: flex;
    flex-direction: row;
    min-height: 0;
    padding-bottom: 0;
  }
}

.MovableBox {
  background-color: #e9efff;
  border: 1px solid #e9e9e9;
  cursor: move;
  position: relative;
  &-content {
    display: block;
  }
}

.RightOpenBtn {
  color: #c2c2c2;
  padding: 5px;
}
`

const template = handledom`
<div class="BoxList">
  <div h="header"></div>
  <ul class="BoxList-ul" h="ul"></ul>
</div>
`

const headerTemplate = handledom`
<header class="BoxList-header WithLoader -right">
  <span>{{ title }}</span>
  <span class="BoxList-spinner WithLoader-l" hidden h="busyIcon"></span>
</header>
`

const liTemplate = handledom`
<li class="BoxList-li MovableBox">
  <span class="MovableBox-content" h="content"></span>
</li>
`

const inlineLiTemplate = handledom`
<li class="BoxList-inlineLi"></li>
`

export interface Box {
  id: string
  el: HTMLElement
}

export interface BoxListOptions {
  /**
   * BoxList ID.
   */
  id?: string

  /**
   * Sortable enables to create groups, so that we can move items between lists that belong to the same group.
   */
  group?: string

  /**
   * Title of the BoxList.
   */
  title?: string

  /**
   * Remove the header.
   */
  noHeader?: boolean

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
  inline?: boolean

  /**
   * Can items be reordered within the BoxList?
   */
  sort?: boolean
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

  private update?: (args: any) => void
  private ulEl: HTMLElement
  private spinnerEl?: HTMLElement
  private sortable: Sortable
  private boxes = new Map<string, HTMLElement>()

  constructor(private dash: Dash, private options: BoxListOptions = {}) {
    const { root, ref } = template()
    this.el = root
    this.ulEl = ref("ul")

    if (!options.noHeader) {
      const { root: headerRoot, ref: headerRef, update } = headerTemplate({
        title: options.title
      })
      this.update = update
      this.spinnerEl = headerRef("busyIcon")
      ref("header").appendChild(headerRoot)
    }

    if (this.options.inline)
      this.el.classList.add("inline")

    this.sortable = this.makeSortable()
  }

  addBox(box: T) {
    const tpl = this.options.inline ? inlineLiTemplate : liTemplate
    const { root, ref } = tpl()
    const li = root

    li.setAttribute("data-id", box.id)

    if (this.options.inline)
      li.appendChild(box.el)
    else
      ref("content").appendChild(box.el)

    this.ulEl.appendChild(li)
    this.boxes.set(box.id, li)
  }

  hasBox(id: string) {
    return this.boxes.has(id)
  }

  removeBox(boxId: string) {
    const liElt = this.boxes.get(boxId)
    if (!liElt)
      return false
    this.ulEl.removeChild(liElt)
    this.boxes.delete(boxId)
    return true
  }

  clear() {
    for (const key of this.boxes.keys())
      this.removeBox(key)
  }

  setTitle(title?: string) {
    if (this.update) {
      this.update({
        title: title || this.options.title || ""
      })
    }
  }

  /**
   * Sort the elements in the boxlist.
   *
   * @param order - array of ids which will be used to sort the boxlist.
   * @see {@link https://github.com/RubaXa/Sortable#sortorderstring}
   */
  sort(order: string[]) {
    this.sortable.sort(order)
  }

  /**
   * Return the IDs of the BoxList elements, based on their current order.
   */
  getOrder(): string[] {
    return this.sortable.toArray()
  }

  enable(hideBusyIcon = false) {
    this.el.style.pointerEvents = this.el.style.pointerEvents = "auto"
    this.el.style.opacity = "1.0"
    if (hideBusyIcon)
      this.showSpinner(false)
  }

  disable(showBusyIcon = false) {
    this.el.style.pointerEvents = this.el.style.pointerEvents = "none"
    this.el.style.opacity = "0.4"
    if (showBusyIcon)
      this.showSpinner(true)
  }

  /**
   * Enable the sorting capabilities of the BoxList.
   *
   * Note: calling this method will have effect only if the `sort` member of the BoxList constructor
   *       was set to true.
   * @param hideIcon - Indicate if the busy icon should be hidden
   */
  enableSort(hideBusyIcon = false) {
    if (this.options.sort && this.sortable.option("disabled")) {
      this.sortable.option("disabled", false)
      if (hideBusyIcon)
        this.showSpinner(false)
    }
  }

  /**
   * Disable the sorting capabilities of the BoxList.
   *
   * Note: calling this method will have effect only if the `sort` member of the BoxList constructor
   *       param was set to true.
   * @param showIcon - Indicate if the busy icon should be displayed
   */
  disableSort(showBusyIcon = false) {
    if (this.options.sort && !this.sortable.option("disabled")) {
      this.sortable.option("disabled", true)
      if (showBusyIcon)
        this.showSpinner(true)
    }
  }

  // --
  // -- Utilities
  // --

  private makeSortable() {
    return Sortable.create(this.ulEl, {
      filter: "button",
      group: this.options.group,
      animation: 150,
      sort: this.options.sort,
      disabled: this.options.disabled ? true : false,

      // Element is dropped into the list from another list.
      onAdd: (ev) => {
        if (ev.item.dataset.id === undefined)
          return
        this.boxes.set(ev.item.dataset.id, ev.item)
        this.dash.emit("boxListItemAdded", {
          boxListId: this.options.id,
          boxId: ev.item.dataset.id
        })
      },

      // Element is moved from the list into another list.
      onRemove: (ev) => {
        if (ev.item.dataset.id === undefined)
          return
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

      // Event when an item is moved inside a list or between lists.
      onMove: ev => {
        if (!this.options.obj || !this.options.onMove)
          return true
        const boxId = ev.dragged.dataset.id
        const boxListId = this.options.id
        if (boxId === undefined || boxListId === undefined)
          return false
        return this.options.onMove.call(this.options.obj, {
          boxId,
          boxListId
        })
      }
    })
  }

  private showSpinner(show: boolean) {
    if (this.spinnerEl)
      this.spinnerEl.hidden = !show
  }
}
