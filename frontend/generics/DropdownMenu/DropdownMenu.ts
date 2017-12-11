import { Dash } from "bkb"
import { render } from "monkberry"
import { MenuItem } from "../Menu/Menu"
import NavMenu, { NavMenuOptions } from "../NavMenu/NavMenu";
import { catchAndLog } from "../../libraries/utils";

const template = require("./DropdownMenu.monk")
const liTemplate = require("./li.monk")

export interface DropdownMenuOptions {
  btnEl: HTMLElement
  /**
   * Default value is: "right"
   */
  align?: "left" | "right"
}

export class DropdownMenu {
  readonly entries: NavMenu
  readonly btnEl: HTMLElement

  private el: HTMLElement
  private detached = true
  private isVisible = false

  constructor(private dash: Dash, private options: DropdownMenuOptions) {
    this.btnEl = options.btnEl
    let view = render(template, document.createElement("div"))
    this.el = view.nodes[0] as HTMLElement
    this.entries = dash.create(NavMenu, {
      direction: "column"
    } as NavMenuOptions)
    this.el.appendChild(this.entries.el)
    if (options.align !== "left")
      this.el.classList.add(options.align || "right")
    this.btnEl.addEventListener("click", catchAndLog(() => this.toggle()))
    dash.listenToChildren("click").onEvent(() => this.hide())
  }

  public toggle() {
    if (this.isVisible)
      this.hide()
    else
      this.show()
  }

  private show() {
    if (this.isVisible)
      return
    if (this.detached)
      this.attachInDom()
    this.position()
    this.isVisible = true
    this.el.style.display = "block"
    this.el.focus()
  }

  private attachInDom() {
    this.detached = false
    let parentEl = this.btnEl.parentElement
    if (!parentEl)
      throw new Error("The DropdownMenu cannot insert in the DOM, the button element is detached")
    parentEl.insertBefore(this.el, this.options.btnEl.nextSibling)
  }

  private position() {
//     let menuTop = this.btnEl.offsetTop + this.btnEl.offsetHeight
//     let menuLeft = this.btnEl.offsetLeft + this.btnEl.offsetWidth - this.el.offsetWidth
//     this.el.style.top = `${menuTop}px`
//     this.el.style.left = `${menuLeft}px`
// console.log("position:", this.btnEl.offsetLeft, this.btnEl.offsetWidth, this.el.offsetWidth)
  }

  private hide() {
    if (!this.isVisible)
      return
    this.isVisible = false
    this.el.style.display = "none"
  }
}
