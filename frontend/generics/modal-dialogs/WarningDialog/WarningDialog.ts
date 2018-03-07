import { Dash } from "bkb"
import { render } from "monkberry"
import Deferred from "../../../libraries/Deferred"

const template = require("./WarningDialog.monk")

export default class WarningDialog {
  private readonly el: HTMLDialogElement
  private msgEl: HTMLElement
  private titleEl: HTMLElement

  private view: MonkberryView

  private currDfd: Deferred<boolean> | undefined

  constructor(private dash: Dash) {
    this.el = this.createView()
  }

  public show(msg: string, title = "Warning"): Promise<boolean> {
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
    el.addEventListener("cancel", ev => {
      ev.preventDefault()
      this.close()
    })
    el.addEventListener("keydown", ev => ev.key === "Enter" && this.close())

    this.msgEl = el.querySelector(".js-message") as HTMLElement
    this.titleEl = el.querySelector(".js-title") as HTMLElement
    let btn = el.querySelector(".js-button") as HTMLButtonElement
    btn.addEventListener("click", ev => this.close())
    let closeItem = el.querySelector(".js-close") as HTMLElement
    closeItem.addEventListener("click", ev => this.close())

    return el
  }

  private close() {
    if (this.currDfd)
      this.currDfd && this.currDfd.resolve(true)
    this.currDfd = undefined
    this.el.close()
    document.body.removeChild(this.el)
  }
}
