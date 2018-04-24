import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import { addCssClass, catchAndLog } from "../../libraries/utils"

const template = require("./NavBtn.monk")
const templateWithAlert = require("./NavBtn-withAlert.monk")
const templateWithInner = require("./NavBtn-withInner.monk")
const templateWrapper = require("./DdMenuWrapper.monk")

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
  readonly innerEl?: HTMLSpanElement

  private labelEl: HTMLElement
  private alertEl?: HTMLElement

  constructor(private dash: Dash, private options: NavBtnOptions) {
    let tpl = options.canHaveAlert ? templateWithAlert : options.innerEl ? templateWithInner : template
    let view = render(tpl)
    this.btnEl = view.rootEl()
    this.labelEl = tpl === template ? this.btnEl : this.btnEl.querySelector(".js-lbl") as HTMLElement

    if (options.label)
      this.setLabel(options.label)

    if (options.canHaveAlert)
      this.alertEl = this.btnEl.querySelector(".js-alert") as HTMLElement

    if (options.icon22)
      this.btnEl.classList.add("-icon22", `-${options.icon22.position}`, options.icon22.cssClass)

    addCssClass(this.btnEl, options.cssClass)

    if (options.onClick)
      this.btnEl.addEventListener("click", catchAndLog(options.onClick))

    if (options.withWrapper) {
      let view = render(templateWrapper)
      this.el = view.rootEl()
      this.el.appendChild(this.btnEl)
    } else
      this.el = this.btnEl

    if (options.innerEl) {
      this.innerEl = this.btnEl.querySelector(".js-inner") as HTMLElement
      this.innerEl.classList.add(options.innerEl.position)
      if (options.innerEl.cssClass)
        this.innerEl.classList.add(options.innerEl.cssClass)
      this.btnEl.classList.add(`${options.innerEl.position}Inner`)
    }
  }

  public setAlertCount(count: number) {
    if (!this.alertEl)
      throw new Error(`The button '${this.options.label}' cannot have an alert`)
    this.alertEl.textContent = `${count}`
    this.alertEl.style.display = count === 0 ? "none" : "block"
  }

  public setLabel(label: string) {
    this.labelEl.textContent = label
  }

  public addCssClass(cssClass: string | string[]) {
    addCssClass(this.el, cssClass)
  }
}
