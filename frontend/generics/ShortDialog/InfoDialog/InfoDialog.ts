import { Dash } from "bkb"
import { render } from "monkberry"
import Deferred from "../../../libraries/Deferred"

const template = require("./info.monk")

export default class InfoDialog {
  private readonly el: HTMLDialogElement
  private msgEl: HTMLElement
  private titleEl: HTMLElement

  private view: MonkberryView

  private currDfd: Deferred<boolean> | undefined

  constructor(private dash: Dash) {
    this.el = this.createView()
  }

  public show(msg: string, title = "Information"): Promise<boolean> {
    this.currDfd = new Deferred()
    this.msgEl.textContent = msg
    this.titleEl.textContent = title
    document.body.appendChild(this.el)
    this.el.showModal()

    return this.currDfd.promise
  }

  private createView() {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLDialogElement
    this.msgEl = el.querySelector(".js-message") as HTMLElement
    this.titleEl = el.querySelector(".js-title") as HTMLElement
    let btn = el.querySelector(".js-button") as HTMLButtonElement
    btn.addEventListener("click", ev => this.currDfd && this.currDfd.resolve(true))

    return el
  }
}
