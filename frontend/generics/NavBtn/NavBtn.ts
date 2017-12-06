import { Dash } from "bkb"
import { render } from "monkberry"

const template = require("./NavBtn.monk")
const templateWithAlert = require("./NavBtn-withAlert.monk")

export interface NavBtnOptions {
  label: string
  cssClass?: string | string[]
  clickHandler: () => void
  canHaveAlert?: boolean
}

export default class NavBtn {
  readonly el: HTMLButtonElement

  private labelEl: HTMLElement
  private alertEl?: HTMLElement

  constructor(private dash: Dash, private options: NavBtnOptions) {
    this.el = this.createView()
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

  private createView() {
    let view = render(this.options.canHaveAlert ? templateWithAlert : template, document.createElement("div"))
    let el = view.nodes[0] as HTMLButtonElement

    this.labelEl = this.options.canHaveAlert ? el.querySelector(".js-lbl") as HTMLElement : el
    this.setLabel(this.options.label)

    if (this.options.canHaveAlert)
      this.alertEl = el.querySelector(".js-alert") as HTMLElement

    if (this.options.cssClass) {
      if (typeof this.options.cssClass === "string")
        el.classList.add(this.options.cssClass)
      else
        el.classList.add(...this.options.cssClass)
    }

    el.onclick = this.options.clickHandler
    return el
  }
}
