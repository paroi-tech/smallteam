import { Dash } from "bkb"
import NavMenu, { NavMenuOptions } from "../NavMenu/NavMenu"
import { render } from "@fabtom/lt-monkberry";
import { catchAndLog } from "../../../sharedFrontend/libraries/utils"

import template = require("./DropdownMenu.monk")
// import liTemplate = require("./li.monk")

export interface DropdownMenuOptions {
  btnEl: HTMLElement
  /** Default value is "right" */
  align?: "left" | "right"
  navMenuOptions?: NavMenuOptions
}

export class DropdownMenu {
  private el: HTMLElement
  readonly btnEl: HTMLElement

  readonly entries: NavMenu

  private detached = true
  private isVisible = false

  constructor(private dash: Dash, private options: DropdownMenuOptions) {
    this.el = render(template).rootEl()
    this.btnEl = options.btnEl
    this.entries = dash.create(NavMenu, makeNavMenuOptions(options))
    this.el.appendChild(this.entries.el)
    this.el.classList.add(options.align === "left" ? "-left" : "-right")

    this.btnEl.addEventListener("click", catchAndLog(() => this.toggle()))
    // Design requirement: menu should be closed when user clicks outside.
    // TSC complains when we used a function to handle the focusout event like this:
    // this.btnEl.addEventListener("focusout", (ev) => doSomething())
    // So we end up with the following code. See the following discussion for more information:
    // https://github.com/Microsoft/TypeScript/issues/1224
    let thisObj = this
    let handler = {
      handleEvent: (ev) => {
        if (thisObj.isVisible && !thisObj.el.contains(ev.relatedTarget as Node))
        thisObj.hide()
      }
    }
    this.btnEl.addEventListener("focusout", handler)
    dash.listenTo("click", () => this.hide())
  }

  toggle() {
    if (this.isVisible)
      this.hide()
    else
      this.show()
  }

  /**
   * IMPORTANT:
   * The two following functions are temporary solutions used to disable the menu.
   * We need them in StepForm when the step displayed in the form is processed by the model
   * and the form need to be locked.
   */
  enable() {
    this.btnEl.style.pointerEvents = "initial"
  }

  disable() {
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

function makeNavMenuOptions(options: DropdownMenuOptions): NavMenuOptions {
  let btnCssClass = options.navMenuOptions ? options.navMenuOptions.btnCssClass : undefined
  btnCssClass = btnCssClass ? (typeof btnCssClass === "string" ? [btnCssClass] : btnCssClass) : []
  btnCssClass.push("DdMenuBtn")

  return {
    direction: "column",
    ...options.navMenuOptions,
    btnCssClass
  }
}
