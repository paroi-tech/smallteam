import { Dash } from "bkb"
import handledom from "handledom"
import { catchAndLog } from "../../../shared-ui/libraries/utils"
import NavMenu, { NavMenuOptions } from "./NavMenu"

// tslint:disable-next-line: no-unused-expression
scss`
.Backdrop {
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
}

.DropdownMenuWrapper {
  position: relative;

  &.-asSuffix {
    margin-left: 10px;
  }
}

.DropdownMenu {
  border: 1px solid #fff;
  min-width: 174px;
  position: absolute;
  z-index: 1001;

  &.-right {
    right: 0;
  }

  &.-left {
    left: 0;
  }
}

.DdMenuBtn {
  background-color: #051837;
  color: #fff;
  padding-bottom: 4px;
  padding-top: 4px;
}
`

const template = handledom`
<nav class="DropdownMenu" hidden></nav>
`

const backdropTemplate = handledom`
<div class="Backdrop" hidden></div>
`

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
    this.el = template().root
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
      this.backdropEl = backdropTemplate().root
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
