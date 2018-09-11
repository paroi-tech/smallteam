import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"

import template = require("./StatusBar.monk")

export default class StatusBar {
  readonly el: HTMLElement

  constructor(private dash: Dash) {
    this.el = render(template).rootEl()
  }

  addItem(el: HTMLElement) {
    this.el.appendChild(el)
  }
}
