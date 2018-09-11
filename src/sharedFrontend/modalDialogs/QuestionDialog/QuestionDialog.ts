import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import { makeOutsideClickHandlerFor } from "../../libraries/utils"
import Deferred from "../../libraries/Deferred"

import template = require("./QuestionDialog.monk")

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

    view.ref("okBtn").addEventListener("click", () => this.close(true))
    view.ref("cancelBtn").addEventListener("click", () => this.close(false))
    view.ref("close").addEventListener("click",  () => this.close(false))

    this.el.addEventListener("cancel", ev => {
      ev.preventDefault()
      this.close(false)
    })
    this.el.addEventListener("keydown", ev => {
      if (ev.key === "Enter")
        this.close(true)
    })

  }

  show(msg: string, title = "Question"): Promise<boolean> {
    this.currDfd = new Deferred()
    this.msgEl.textContent = msg
    this.titleEl.textContent = title

    document.body.appendChild(this.el)
    makeOutsideClickHandlerFor(this.el, () => this.close(false))
    this.el.showModal()

    return this.currDfd.promise
  }

  private close(b: boolean) {
    if (this.currDfd)
      this.currDfd.resolve(b)
    this.currDfd = undefined
    this.el.close()
    document.body.removeChild(this.el)
  }
}
