import { Dash } from "bkb"
import NavMenu from "../NavMenu/NavMenu";
import { render } from "@fabtom/lt-monkberry";

const template = require("./HeaderBar.monk")

export default class HeaderBar {
  readonly el: HTMLElement
  readonly entries: NavMenu

  private teamNameEl: HTMLElement

  constructor(private dash: Dash) {
    let view = render(template)
    this.el = view.rootEl()

    this.teamNameEl =  view.ref("teamName")

    this.entries = dash.create(NavMenu)
    this.el.appendChild(this.entries.el)
  }
}
