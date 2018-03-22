import { Dash } from "bkb"
import { render } from "monkberry"

const template = require("./StatusBar.monk")

export default class StatusBar {
  readonly el: HTMLElement

  constructor(private dash: Dash) {
    this.el = render(template, document.createElement("div")).nodes[0] as HTMLButtonElement
  }

  public addItem(el: HTMLElement) {
    this.el.appendChild(el)
  }
}
