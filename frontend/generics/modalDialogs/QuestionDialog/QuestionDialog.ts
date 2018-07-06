import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import Deferred from "../../../libraries/Deferred"
import { makeOutsideClickHandlerFor } from "../modalDialogs"

const template = require("./QuestionDialog.monk")

export default class QuestionDialog {
  private readonly el: HTMLDialogElement
  private msgEl: HTMLElement
  private titleEl: HTMLElement

  private currDfd: Deferred<boolean> | undefined

  constructor(private dash: Dash) {
    let view = render(template)
    this.el = view.rootEl()
    this.msgEl = view.ref("message")
    this.titleEl = view.ref("title")

    view.ref("okBtn").addEventListener("click", ev => this.close(true))
    let closeCb = ev => this.close(false)
    view.ref("cancelBtn").addEventListener("click", closeCb)
    view.ref("close").addEventListener("click", closeCb)
    this.el.addEventListener("cancel", ev => {
      ev.preventDefault()
      this.close(false)
    })
    this.el.addEventListener("keydown", ev => {
      if (ev.key === "Enter")
      this.close(true)
    })

    document.body.appendChild(this.el)
  }

  public show(msg: string, title = "Error"): Promise<boolean> {
    this.currDfd = new Deferred()
    this.msgEl.textContent = msg
    this.titleEl.textContent = title
    makeOutsideClickHandlerFor(this.el, () => this.close(false))
    this.el.showModal()
    return this.currDfd.promise
  }

  private close(b: boolean) {
    if (this.currDfd)
      this.currDfd && this.currDfd.resolve(true)
    this.currDfd = undefined
    this.el.close()
    document.body.removeChild(this.el)
  }
}
