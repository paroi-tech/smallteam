import { Dash } from "bkb"
import { render } from "monkberry"
import NavBtn, { NavBtnOptions } from "../NavBtn/NavBtn";
import { catchAndLog, addCssClass } from "../../libraries/utils";

const template = require("./NavMenu.monk")
const liTemplate = require("./li.monk")

export type Direction = "row" | "column" | "rowReverse" | "columnReverse"

export interface NavMenuOptions {
  cssClass?: string | string[]
  /**
   * Default value is: "row"
   */
  direction?: Direction
}

export interface NavMenuButton {
  el: HTMLElement
}

export default class NavMenu {
  readonly el: HTMLUListElement

  constructor(private dash: Dash, private options: NavMenuOptions = {}) {
    let view = render(template, document.createElement("div"))
    this.el = view.nodes[0] as HTMLUListElement
    if (this.options.direction)
      this.el.classList.add(this.options.direction)
    addCssClass(this.el, this.options.cssClass)
    this.el.addEventListener("click", catchAndLog(() => this.dash.emit("click")))
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
}
