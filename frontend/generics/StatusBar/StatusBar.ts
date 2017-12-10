import { Dash } from "bkb"
import { render } from "monkberry"

const template = require("./StatusBar.monk")

export default class StatusBar {
  readonly el: HTMLElement

  constructor(private dash: Dash) {
    this.el = this.createView()
  }

  private createView() {
    let view = render(template, document.createElement("div"))
    let el = view.nodes[0] as HTMLButtonElement
    return el
  }

  public addItem(el: HTMLElement) {
    this.el.appendChild(el)
  }
}
