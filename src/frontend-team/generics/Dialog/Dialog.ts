import { render } from "@fabtom/lt-monkberry"
import { makeOutsideClickHandlerFor } from "../../../sharedFrontend/libraries/utils"
import { Dash } from "bkb"

const template = require("./Dialog.monk")

export default class Dialog {
  private readonly el: HTMLDialogElement

  constructor(private dash: Dash, readonly contentEl: HTMLElement, readonly title: string) {
    let view = render(template)

    this.el = view.rootEl()
    view.ref("title").textContent = title
    view.ref("content").appendChild(contentEl)
    view.ref("close").addEventListener("click", () => this.close())
  }

  show() {
    makeOutsideClickHandlerFor(this.el, () => this.close())
    document.body.appendChild(this.el)
    this.el.showModal()
  }

  private close() {
    this.el.close()
    document.body.removeChild(this.el)
  }
}
