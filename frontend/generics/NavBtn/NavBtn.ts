import { Dash } from "bkb"
import { render } from "monkberry"
import { addCssClass, catchAndLog } from "../../libraries/utils";

const template = require("./NavBtn.monk")
const templateWithAlert = require("./NavBtn-withAlert.monk")
const templateWrapper = require("./NavBtnWrapper.monk")

export interface NavBtnOptions {
  label: string
  cssClass?: string | string[]
  onClick?: () => void
  canHaveAlert?: boolean
  withWrapper?: boolean
}

export default class NavBtn {
  readonly el: HTMLElement
  readonly btnEl: HTMLButtonElement

  private labelEl: HTMLElement
  private alertEl?: HTMLElement

  constructor(private dash: Dash, private options: NavBtnOptions) {
    let view = render(options.canHaveAlert ? templateWithAlert : template, document.createElement("div"))
    this.btnEl = view.nodes[0] as HTMLButtonElement

    this.labelEl = options.canHaveAlert ? this.btnEl.querySelector(".js-lbl") as HTMLElement : this.btnEl
    this.setLabel(options.label)

    if (options.canHaveAlert)
      this.alertEl = this.btnEl.querySelector(".js-alert") as HTMLElement

    addCssClass(this.btnEl, options.cssClass)

    if (options.onClick)
      this.btnEl.addEventListener("click", catchAndLog(options.onClick))

    if (options.withWrapper) {
      let view = render(templateWrapper, document.createElement("div"))
      this.el = view.nodes[0] as HTMLButtonElement
      this.el.appendChild(this.btnEl)
    } else
      this.el = this.btnEl
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
