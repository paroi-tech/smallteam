require("./_StatusBar.scss")
import { render } from "@tomko/lt-monkberry"
import { Dash } from "bkb"

const template = require("./StatusBar.monk")

export default class StatusBar {
  readonly el: HTMLElement

  constructor(private dash: Dash) {
    this.el = render(template).rootEl()
  }

  addItem(el: HTMLElement) {
    this.el.appendChild(el)
  }
}
