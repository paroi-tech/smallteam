import { Dash } from "bkb"
import { render } from "monkberry"

const template = require("./HeaderBar.monk")
const liTemplate = require("./li.monk")

export interface HeaderBarButton {
  el: HTMLElement
}

export default class Sidebar {
  readonly el: HTMLElement

  private view: MonkberryView
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
    let el = document.createElement("div")
    this.view = render(template, el)

    this.teamNameEl =  this.el.querySelector(".js-teamName") as HTMLElement
    this.menuUl =  this.el.querySelector(".js-menuUl") as HTMLUListElement

    return el
  }
}
