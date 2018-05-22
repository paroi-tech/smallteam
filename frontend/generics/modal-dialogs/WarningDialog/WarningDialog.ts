import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import Deferred from "../../../libraries/Deferred"

const template = require("./WarningDialog.monk")

export default class WarningDialog {
  private readonly el: HTMLDialogElement
  private msgEl: HTMLElement
  private titleEl: HTMLElement

  private currDfd: Deferred<boolean> | undefined

  private clickHandler: (ev: MouseEvent) => void

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

    // Design requirement: if the user clicks outside a modal dialog, the dialog should be closed.
    // To detect click outside the dialog, we check if the coordinates of the mouse lie inside the dialog's rectangle.
    // Note: when handling click on the dialog backdrop, the event target property corresponds to the dialog elt.
    this.clickHandler = (ev: MouseEvent) => {
      if (this.el.open && ev.target === this.el) {
        let rect = this.el.getBoundingClientRect()
        if (ev.clientX < rect.left || ev.clientX > rect.right || ev.clientY < rect.top || ev.clientY > rect.bottom)
          this.close()
      }
    }

    document.body.appendChild(this.el)
  }

  public show(msg: string, title = "Warning"): Promise<boolean> {
    this.currDfd = new Deferred()
    this.msgEl.textContent = msg
    this.titleEl.textContent = title

    document.body.addEventListener("click", this.clickHandler)
    this.el.showModal()
    return this.currDfd.promise
  }

  private close() {
    if (this.currDfd)
      this.currDfd && this.currDfd.resolve(true)
    this.currDfd = undefined
    document.body.removeEventListener("click", this.clickHandler)
    this.el.close()
    document.body.removeChild(this.el)
  }
}
