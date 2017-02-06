import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"

const template = require("html-loader!./dropdownmenu.html")
const itemTemplate = require("html-loader!./element.html")

export interface DropdownMenuItem {
  id: string,
  label: string
}

export class DropdownMenu {
  readonly bkb: Bkb

  private $container: JQuery
  private $ul: JQuery

  private items: Map<string, JQuery>

  constructor(private dash: Dash<App>) {
    this.items = new Map<string, JQuery>()

    this.$container = $(template)
    this.$ul = this.$container.find(".js-ul")
    this.$container.find(".js-btn").click(ev => {
      this.$ul.toggle()
    })
  }

  public addItem(item: DropdownMenuItem) {
    if (this.items.has(item.id))
      throw new Error(`ID already exists in dropdown menu: ${item.id}`)

    let $li  = $(itemTemplate)
    let $btn = $li.find(".js-btn")
    $btn.text(item.label)
    $btn.click(ev => {
      this.$ul.toggle()
      console.log(`Click on dropdown menu item ${item.label}`)
      this.dash.emit("menuItemSelected", { itemId: item.id })
    })
    this.items.set(item.id, $li)
    this.$ul.append($li)
  }

  public addItems(items: Array<DropdownMenuItem>) {
    for (let i of items)
      this.addItem(i)
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public disableItem(itemId: string) {
    let $i = this.items.get(itemId)
    if ($i)
      $i.prop('disabled', true);
  }

  public enableItem(itemId: string) {
    let $i = this.items.get(itemId)
    if ($i)
      $i.prop('disabled', false);
  }
}