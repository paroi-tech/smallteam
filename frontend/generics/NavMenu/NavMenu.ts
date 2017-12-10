import { Dash } from "bkb"
import { render } from "monkberry"
import NavBtn, { NavBtnOptions } from "../NavBtn/NavBtn";

const template = require("./NavMenu.monk")
const liTemplate = require("./li.monk")

export interface NavMenuButton {
  el: HTMLElement
}

export default class NavMenu {
  readonly el: HTMLUListElement

  constructor(private dash: Dash) {
    this.el = this.createView()
  }

  public createNavBtn(...btnOptions: NavBtnOptions[]) {
    this.addItem(...btnOptions.map(options => this.dash.create(NavBtn, options)))
  }

  public addItem(...buttons: NavMenuButton[]) {
    for (let btn of buttons) {
      let view = render(liTemplate, document.createElement("div"))
      let li = view.nodes[0] as HTMLLIElement
      li.appendChild(btn.el)
      this.el.appendChild(li)
    }
  }

  private createView() {
    let view = render(template, document.createElement("div"))
    let el = view.nodes[0] as HTMLUListElement
    return el
  }
}
