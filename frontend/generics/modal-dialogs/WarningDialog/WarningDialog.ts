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
    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLDialogElement
    this.el.addEventListener("cancel", ev => {
      ev.preventDefault()
      this.close()
    })
    this.el.addEventListener("keydown", ev => ev.key === "Enter" && this.close())
    this.msgEl = this.el.querySelector(".js-message") as HTMLElement
    this.titleEl = this.el.querySelector(".js-title") as HTMLElement

    let btn = this.el.querySelector(".js-button") as HTMLButtonElement
    let closeItem = this.el.querySelector(".js-close") as HTMLElement
    btn.addEventListener("click", ev => this.close())
    closeItem.addEventListener("click", ev => this.close())
  }

  public show(msg: string, title = "Warning"): Promise<boolean> {
    this.currDfd = new Deferred()
    this.msgEl.textContent = msg
    this.titleEl.textContent = title
    document.body.appendChild(this.el)
    this.el.showModal()

    return this.currDfd.promise
  }

  private close() {
    if (this.currDfd)
      this.currDfd && this.currDfd.resolve(true)
    this.currDfd = undefined
    this.el.close()
    document.body.removeChild(this.el)
  }
}
