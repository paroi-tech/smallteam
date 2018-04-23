import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import Deferred from "../../../libraries/Deferred"

const template = require("./PromptDialog.monk")

export default class PromptDialog {
  private readonly el: HTMLDialogElement
  private msgEl: HTMLElement
  private titleEl: HTMLElement
  private inputEl: HTMLInputElement

  private currDfd: Deferred<string> | undefined

  constructor(private dash: Dash) {
    let view = render(template)
    this.el = view.rootEl()
    this.msgEl = view.ref("message")
    this.titleEl = view.ref("title")
    this.inputEl = view.ref("input")

    view.ref("okBtn").addEventListener("click", ev => {
      if (this.inputEl.value !== "")
        this.close(this.inputEl.value)
    })
    view.ref("cancelBtn").addEventListener("click", ev => this.close(""))
    view.ref("close").addEventListener("click", ev => this.close(""))
    this.el.addEventListener("cancel", ev => {
      ev.preventDefault()
      this.close("")
    })
    this.el.addEventListener("keydown", ev => {
      if (ev.key === "Enter" && this.inputEl.value !== "")
        this.close(this.inputEl.value)
    })

    document.body.appendChild(this.el)
  }

  public show(msg: string, title = "Prompt"): Promise<string> {
    this.currDfd = new Deferred()
    this.msgEl.textContent = msg
    this.titleEl.textContent = title
    this.el.showModal()

    return this.currDfd.promise
  }

  private close(s: string) {
    if (this.currDfd)
      this.currDfd && this.currDfd.resolve(s)
    this.currDfd = undefined
    this.el.close()
    document.body.removeChild(this.el)
  }
}
