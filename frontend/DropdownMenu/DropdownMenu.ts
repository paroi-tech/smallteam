import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { MenuItem, MenuEvent } from "../Menu/Menu"

const template = require("html-loader!./dropdownmenu.html")
const itemTemplate = require("html-loader!./element.html")

/**
 * Dropdown menu component.
 *
 * It is made by a button and a list of clickable items shown when the button is clicked.
 * Each item in the menu has an ID and an event emited when clicked.
 */
export class DropdownMenu {
  readonly bkb: Bkb

  private $container: JQuery
  private $ul: JQuery

  private itemMap: Map<string, JQuery>

  /**
   * Create a new dropdown menu.
   */
  constructor(private dash: Dash<App>, readonly id: string, readonly name: string, readonly align: "left" | "right") {
    this.itemMap = new Map<string, JQuery>()
    this.initJQueryObjects()
  }

  /**
   * Create JQuery objects from the component template.
   */
  private initJQueryObjects() {
    this.$container = $(template)
    this.$ul = this.$container.find(".js-ul")
    this.$ul.css(this.align === "left" ? "left" : "right", "inherit")
    this.$container.find(".js-btn").click(ev => this.$ul.toggle())
  }

  /**
   * Add an item to the menu.
   *
   * @param item - the item to add.
   */
  public addItem(item: MenuItem) {
    if (this.itemMap.has(item.id))
      throw new Error(`ID already exists in dropdown menu: ${item.id}`)
    let $li  = $(itemTemplate)
    let $btn = $li.find(".js-btn")
    $btn.text(item.label)
    $btn.click(ev => {
      this.$ul.toggle()
      this.dash.emit(item.eventName, { menuId: this.id, itemId: item.id })
    })
    this.itemMap.set(item.id, $li)
    this.$ul.append($li)
  }

  /**
   * Add several items to the menu.
   *
   * @param items - items to add.
   */
  public addItems(items: Array<MenuItem>) {
    for (let i of items)
      this.addItem(i)
  }

  /**
   * Add the dropdown menu to a container.
   *
   * @param el - element that the box will be added to.
   */
  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  /**
   * Disable an item of the menu.
   *
   * @param id - the id of the item to disable.
   */
  public disableItem(id: string) {
    let $i = this.itemMap.get(id)
    if ($i)
      $i.prop("disabled", true);
  }

  /**
   * Enable an item of the menu.
   *
   * @param id - the id of the item to enable.
   */
  public enableItem(itemId: string) {
    let $i = this.itemMap.get(itemId)
    if ($i)
      $i.prop("disabled", false);
  }
}
