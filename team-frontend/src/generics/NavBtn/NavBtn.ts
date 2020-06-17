require("./_NavBtn.scss")
import { render } from "@tomko/lt-monkberry"
import { Dash } from "bkb"
import handledom from "handledom"
import { addCssClass, catchAndLog } from "../../../../shared-ui/libraries/utils"

const template = require("./NavBtn.monk")

const templateWrapper = handledom`
<div class="DdMenuWrapper"></div>
`

export interface NavBtnIcon {
  position: "left" | "right"
  cssClass: string
}

export interface NavBtnInnerEl {
  position: "left" | "right"
  cssClass?: string
}

export interface NavBtnOptions {
  label?: string
  cssClass?: string | string[]
  onClick?: () => void
  canHaveAlert?: boolean
  icon22?: NavBtnIcon
  withWrapper?: boolean
  innerEl?: NavBtnInnerEl
}

export default class NavBtn {
  readonly el: HTMLElement
  readonly btnEl: HTMLButtonElement
  readonly innerEl?: HTMLElement

  private labelEl: HTMLElement
  private alertEl?: HTMLElement

  constructor(private dash: Dash, private options: NavBtnOptions) {
    let altMode = options.canHaveAlert ? "alert" : options.innerEl ? "inner" : undefined
    let view = render(template)
    view.update({ altMode })

    this.btnEl = view.rootEl()
    this.labelEl = altMode ? view.ref("lbl") : this.btnEl

    if (options.label)
      this.setLabel(options.label)

    if (options.canHaveAlert)
      this.alertEl = view.ref("alert") as HTMLElement

    if (options.icon22)
      this.btnEl.classList.add("-icon22", `-${options.icon22.position}`, options.icon22.cssClass)

    addCssClass(this.btnEl, options.cssClass)

    if (options.onClick)
      this.btnEl.addEventListener("click", catchAndLog(options.onClick))

    if (options.withWrapper) {
      this.el = templateWrapper().root
      this.el.appendChild(this.btnEl)
    } else
      this.el = this.btnEl

    if (options.innerEl) {
      this.innerEl = view.ref("inner")
      this.innerEl!.classList.add(`-${options.innerEl.position}`)
      if (options.innerEl.cssClass)
        this.innerEl!.classList.add(options.innerEl.cssClass)
      this.btnEl.classList.add(`-${options.innerEl.position}Inner`)
    }
  }

  setAlertCount(count: number) {
    if (!this.alertEl)
      throw new Error(`The button '${this.options.label}' cannot have an alert`)
    this.alertEl.textContent = `${count}`
    this.alertEl.style.display = count === 0 ? "none" : "block"
  }

  setLabel(label: string) {
    this.labelEl.textContent = label
  }

  addCssClass(cssClass: string | string[]) {
    addCssClass(this.el, cssClass)
  }
}
