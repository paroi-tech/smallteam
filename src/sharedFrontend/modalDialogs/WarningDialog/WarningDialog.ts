import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import { makeOutsideClickHandlerFor } from "../../libraries/utils"
import Deferred from "../../libraries/Deferred"

const template = require("./WarningDialog.monk")

export default class WarningDialog {
  private readonly el: HTMLDialogElement
  private msgEl: HTMLElement
  private titleEl: HTMLElement

  private currDfd: Deferred<boolean> | undefined

  constructor(private dash: Dash) {
    let view = render(template)
    this.el = view.rootEl()
    this.msgEl = view.ref("message")
    this.titleEl = view.ref("title")

    let closeCb = ev => this.close()
    view.ref("button").addEventListener("click", closeCb)
    view.ref("close").addEventListener("click", closeCb)
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

  show(msg: string, title = "Warning"): Promise<boolean> {
    this.currDfd = new Deferred()
    this.msgEl.textContent = msg
    this.titleEl.textContent = title
    makeOutsideClickHandlerFor(this.el, () => this.close())
    this.el.showModal()
    return this.currDfd.promise
  }

  private close() {
    if (this.currDfd)
      this.currDfd.resolve(true)
    this.currDfd = undefined
    this.el.close()
    document.body.removeChild(this.el)
  }
}
