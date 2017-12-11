import { Dash } from "bkb"
import { render } from "monkberry"
import NavMenu from "../NavMenu/NavMenu";

const template = require("./HeaderBar.monk")

export default class HeaderBar {
  readonly el: HTMLElement
  readonly entries: NavMenu

  private teamNameEl: HTMLElement

  constructor(private dash: Dash) {
    let view = render(template, document.createElement("div"))
    this.el = view.nodes[0] as HTMLLIElement

    this.teamNameEl =  this.el.querySelector(".js-teamName") as HTMLElement

    this.entries = dash.create(NavMenu)
    this.el.appendChild(this.entries.el)
  }
}
