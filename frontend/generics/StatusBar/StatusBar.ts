import { Dash } from "bkb"
import { render } from "monkberry"

const template = require("./StatusBar.monk")

export default class StatusBar {
  readonly el: HTMLElement

  private view: MonkberryView

  constructor(private dash: Dash) {
    this.el = this.createView()
  }

  private createView() {
    let el = document.createElement("div")
    this.view = render(template, el)
    return el
  }
}
