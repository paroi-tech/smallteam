require("./_DropdownMenu.scss")
import { render } from "@tomko/lt-monkberry"
import { Dash } from "bkb"
import { catchAndLog } from "../../../../shared-ui/libraries/utils"
import NavMenu, { NavMenuOptions } from "../NavMenu/NavMenu"

const template = require("./DropdownMenu.monk")
const backdropTemplate = require("./Backdrop.monk")

export interface DropdownMenuOptions {
  btnEl: HTMLElement
  /** Default value is "right" */
  align?: "left" | "right"
  navMenuOptions?: NavMenuOptions
}

export class DropdownMenu {
  readonly btnEl: HTMLElement
  readonly entries: NavMenu

  private el: HTMLElement
  private backdropEl?: HTMLElement
  private detached = true
  private isVisible = false

  constructor(private dash: Dash, private options: DropdownMenuOptions) {
    this.el = render(template).rootEl()
    this.btnEl = options.btnEl
    this.entries = dash.create(NavMenu, makeNavMenuOptions(options))
    this.el.appendChild(this.entries.el)
    this.el.classList.add(options.align === "left" ? "-left" : "-right")

    this.btnEl.addEventListener("click", catchAndLog(() => this.toggle()))

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
    this.isVisible = true
    this.el.style.display = "block"
    this.el.focus()
    this.showBackdrop(true)
  }

  private hide() {
    if (!this.isVisible)
      return
    this.isVisible = false
    this.el.style.display = "none"
    this.showBackdrop(false)
  }

  private attachInDom() {
    this.detached = false
    let parentEl = this.btnEl.parentElement
    if (!parentEl)
      throw new Error("The DropdownMenu cannot insert in the DOM, the button element is detached")
    parentEl.insertBefore(this.el, this.options.btnEl.nextSibling)
  }

  private showBackdrop(show: boolean) {
    if (!this.backdropEl) {
      this.backdropEl = render(backdropTemplate).rootEl<HTMLElement>()
      this.backdropEl.addEventListener("click", () => this.hide())
      this.el.parentElement!.appendChild(this.backdropEl)
    }
    this.backdropEl.hidden = !show
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