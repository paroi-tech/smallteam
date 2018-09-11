import { render } from "@fabtom/lt-monkberry"
import { makeOutsideClickHandlerFor } from "../../../sharedFrontend/libraries/utils"
import { Dash } from "bkb"

const template = require("./Dialog.monk")

export default class Dialog {
  private readonly el: HTMLDialogElement
  private promise: Promise<any>
  private resolveCb!: (v?: any) => void

  constructor(private dash: Dash, readonly contentEl: HTMLElement, readonly title: string) {
    let view = render(template)

    this.el = view.rootEl()
    view.ref("title").textContent = title
    view.ref("content").appendChild(contentEl)
    view.ref("close").addEventListener("click", () => this.close())
    this.el.addEventListener("cancel", ev => {
      ev.preventDefault()
      this.close()
    })

    this.promise = new Promise((resolve) => this.resolveCb = resolve)
  }

  show() {
    makeOutsideClickHandlerFor(this.el, () => this.close())
    document.body.appendChild(this.el)
    this.el.showModal()

    return this.promise
  }

  private close() {
    if (!this.el.open)
      return
    this.el.close()
    document.body.removeChild(this.el)
    this.resolveCb()
  }
}

