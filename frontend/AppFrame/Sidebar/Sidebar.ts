import { Dash } from "bkb"
import { render } from "monkberry"

const template = require("./Sidebar.monk")

export interface HeaderBarButton {
  el: HTMLElement
}

export default class Sidebar {
  readonly el: HTMLElement

  private teamNameEl: HTMLElement
  private menuUl: HTMLUListElement

  constructor(private dash: Dash) {
    this.el = this.createView()
  }

  private createView() {
    let view = render(template, document.createElement("div"))
    let el = view.nodes[0] as HTMLLIElement

    return el
  }
}
