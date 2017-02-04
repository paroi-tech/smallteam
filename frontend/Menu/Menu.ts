import * as $ from "jquery"
import { Dash, Bkb, Component } from "bkb"
import App from "../App/App"

const template = require("html-loader!./menu.html")

export default class Menu {
  readonly bkb: Bkb

  private $container: JQuery
  private $ul: JQuery
  private $dropdownList: JQuery

  private elements: Map<string, JQuery>

  constructor(private dash: Dash<App>, id: string, title: string) {
    this.$container = $(template)
    this.$ul = this.$container.find(".js-ul")
    this.$dropdownList = this.$container.find(".js-dropdown-list")

    this.elements = new Map<string, JQuery>()
  }

  public addMenuEntry(entryId: string, entryLabel: string) {
    let $li = $("<li></li>")
    $li.text(entryLabel)
    $li.click((ev) => {
      console.log(`Click on menu entry ${entryLabel}`)
      this.dash.emit("menuEntrySelected", { entryId });
    })
    this.$ul.append($li)
    this.elements.set(entryId, $li)
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public init() {
    this.$container.find(".js-btn").click(() => {
      console.log("Dropdown menu button clicked...")
      this.$dropdownList.toggle()
    })
    this.$dropdownList.find(".js-add-project-btn").click(() => {
      console.log("Add project button clicked...")
      this.$dropdownList.toggle()
      this.dash.emit("menuEntrySelected", { entryId: null })
    })
    return this
  }
}