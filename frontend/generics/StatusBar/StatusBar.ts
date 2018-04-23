import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"

const template = require("./StatusBar.monk")

export default class StatusBar {
  readonly el: HTMLElement

  constructor(private dash: Dash) {
    this.el = render(template).rootEl()
  }

  public addItem(el: HTMLElement) {
    this.el.appendChild(el)
  }
}
