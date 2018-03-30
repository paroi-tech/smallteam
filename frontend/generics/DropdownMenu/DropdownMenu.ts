import { Dash } from "bkb"
import { render } from "monkberry"
import { MenuItem } from "../Menu/Menu"
import NavMenu, { NavMenuOptions } from "../NavMenu/NavMenu"
import { catchAndLog } from "../../libraries/utils"

const template = require("./DropdownMenu.monk")
const liTemplate = require("./li.monk")

export interface DropdownMenuOptions {
  btnEl: HTMLElement
  align?: "left" | "right" // Default value is "right".
  navMenuOptions?: NavMenuOptions
}

export class DropdownMenu {
  private el: HTMLElement
  readonly btnEl: HTMLElement

  readonly entries: NavMenu

  private detached = true
  private isVisible = false

  constructor(private dash: Dash, private options: DropdownMenuOptions) {
    this.el = render(template, document.createElement("div")).nodes[0] as HTMLElement
    this.btnEl = options.btnEl
    this.entries = dash.create(NavMenu, makeNavMenuOptions(options))

    this.el.appendChild(this.entries.el)
    if (options.align !== "left")
      this.el.classList.add(options.align || "right")
    this.btnEl.addEventListener("click", catchAndLog(() => this.toggle()))

    dash.listenTo("click", () => this.hide())
  }

  public toggle() {
    if (this.isVisible)
      this.hide()
    else
      this.show()
  }

  /**
   * IMPORTANT:
   * The two following functions are temporary solutions used to disable the menu.
   * We need them in StepForm when the ste displayed in the form is processed by the model
   * and the form need to be locked.
   */
  public enable() {
    this.btnEl.style.pointerEvents = "initial"
  }

  public disable() {
    this.btnEl.style.pointerEvents = "none"
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

  private hide() {
    if (this.isVisible) {
      this.isVisible = false
      this.el.style.display = "none"
    }
  }

  private attachInDom() {
    this.detached = false
    let parentEl = this.btnEl.parentElement
    if (!parentEl)
      throw new Error("The DropdownMenu cannot insert in the DOM, the button element is detached")
    parentEl.insertBefore(this.el, this.options.btnEl.nextSibling)
  }

  private position() {
    // let menuTop = this.btnEl.offsetTop + this.btnEl.offsetHeight
    // let menuLeft = this.btnEl.offsetLeft + this.btnEl.offsetWidth - this.el.offsetWidth
    //
    // this.el.style.top = `${menuTop}px`
    // this.el.style.left = `${menuLeft}px`
    // console.log("position:", this.btnEl.offsetLeft, this.btnEl.offsetWidth, this.el.offsetWidth)
  }
}

function makeNavMenuOptions(options: DropdownMenuOptions) {
  let btnCssClass = options.navMenuOptions ? options.navMenuOptions.btnCssClass : undefined
  btnCssClass = btnCssClass ? (typeof btnCssClass === "string" ? [btnCssClass] : btnCssClass) : []
  btnCssClass.push("DdMenuBtn")

  return {
    direction: "column",
    ...options.navMenuOptions,
    btnCssClass
  }
}
