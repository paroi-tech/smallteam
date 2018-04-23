import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import Deferred from "../../../libraries/Deferred"

const template = require("./ErrorDialog.monk")

export default class ErrorDialog {
  private readonly el: HTMLDialogElement
  private msgEl: HTMLElement
  private titleEl: HTMLElement

  private currDfd: Deferred<boolean> | undefined

  constructor(private dash: Dash) {
    let view = render(template)
    this.el = view.rootEl()
    this.msgEl = view.ref("message")
    this.titleEl = view.ref("title")

    view.ref("button").addEventListener("click", ev => this.close())
    view.ref("close").addEventListener("click", ev => this.close())
    this.el.addEventListener("cancel", ev => {
      ev.preventDefault()
      this.close()
    })
    this.el.addEventListener("keydown", ev => {
      if (ev.key === "Enter")
        this.close()
    })

    document.body.appendChild(this.el)
  }

  public show(msg: string, title = "Error"): Promise<boolean> {
    this.currDfd = new Deferred()
    this.msgEl.textContent = msg
    this.titleEl.textContent = title
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
