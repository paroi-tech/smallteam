import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import NavBtn, { NavBtnOptions } from "../NavBtn/NavBtn"
import { addCssClass, catchAndLog } from "../../../sharedFrontend/libraries/utils";

import template = require("./NavMenu.monk")
import liTemplate = require("./li.monk")

export type Direction = "row" | "column" | "rowReverse" | "columnReverse"

export interface NavMenuOptions {
  /** Default value is: "row" */
  direction?: Direction
  cssClass?: string | string[]
  btnCssClass?: string | string[]
}

export interface NavMenuButton {
  el: HTMLElement
  addCssClass(cssClass: string | string[]): void
}

export default class NavMenu {
  readonly el: HTMLUListElement

  constructor(private dash: Dash, private options: NavMenuOptions = {}) {
    let view = render(template)
    this.el = view.rootEl()
    if (this.options.direction)
      this.el.classList.add(`-${this.options.direction}`)
    addCssClass(this.el, this.options.cssClass)
    this.el.addEventListener("click", catchAndLog(() => this.dash.emit("click")))
  }

  createNavBtn(...btnOptions: NavBtnOptions[]) {
    this.addItem(...btnOptions.map(options => this.dash.create(NavBtn, options)))
  }

  addItem(...buttons: NavMenuButton[]) {
    for (let btn of buttons) {
      if (this.options.btnCssClass)
        btn.addCssClass(this.options.btnCssClass)
      let li = render(liTemplate).rootEl() as HTMLLIElement
      li.appendChild(btn.el)
      this.el.appendChild(li)
    }
  }
}
