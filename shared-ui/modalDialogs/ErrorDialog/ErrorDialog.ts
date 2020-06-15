require("./_ErrorDialog.scss")
import { render } from "@tomko/lt-monkberry"
import { Dash } from "bkb"
import Deferred from "../../libraries/Deferred"
import { makeOutsideClickHandlerFor } from "../../libraries/utils"

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

    let closeCb = () => this.close()

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

  }

  show(msg: string, title = "Error"): Promise<boolean> {
    this.currDfd = new Deferred()
    this.msgEl.textContent = msg
    this.titleEl.textContent = title

    document.body.appendChild(this.el)
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
