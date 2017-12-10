import { Dash } from "bkb"
import { render } from "monkberry"

const template = require("./HeaderBar.monk")
const liTemplate = require("./li.monk")

export interface HeaderBarButton {
  el: HTMLElement
}

export default class HeaderBar {
  readonly el: HTMLElement

  private teamNameEl: HTMLElement
  private menuUl: HTMLUListElement

  constructor(private dash: Dash) {
    this.el = this.createView()
  }

  public addMenuItem(btn: HeaderBarButton) {
    let view = render(liTemplate, document.createElement("div"))
    let li = view.nodes[0] as HTMLLIElement
    li.appendChild(btn.el)
    this.menuUl.appendChild(li)
  }

  private createView() {
    let view = render(template, document.createElement("div"))
    let el = view.nodes[0] as HTMLLIElement

    this.teamNameEl =  el.querySelector(".js-teamName") as HTMLElement
    this.menuUl = el.querySelector(".js-menuUl") as HTMLUListElement

    return el
  }
}
