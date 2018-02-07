import { Dash } from "bkb"
import { render } from "monkberry"
import Deferred from "../../../libraries/Deferred"

const template = require("./PromptDialog.monk")

export default class PromptDialog {
  private readonly el: HTMLDialogElement
  private msgEl: HTMLElement
  private titleEl: HTMLElement
  private inputEl: HTMLInputElement

  private view: MonkberryView

  private currDfd: Deferred<string> | undefined

  constructor(private dash: Dash) {
    this.el = this.createView()
  }

  public show(msg: string, title = "Prompt"): Promise<string> {
    this.currDfd = new Deferred()
    this.msgEl.textContent = msg
    this.titleEl.textContent = title
    document.body.appendChild(this.el)
    this.el.showModal()

    return this.currDfd.promise
  }

  private createView() {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLDialogElement
    el.addEventListener("cancel", ev => {
      ev.preventDefault()
      this.close("")
    })
    el.addEventListener("keydown", ev => {
      if (ev.key === "Enter" && this.inputEl.value !== "")
        this.close(this.inputEl.value)
    })

    this.msgEl = el.querySelector(".js-message") as HTMLElement
    this.titleEl = el.querySelector(".js-title") as HTMLElement
    this.inputEl = el.querySelector(".js-input") as HTMLInputElement

    let okBtn = el.querySelector(".js-ok-button") as HTMLButtonElement
    okBtn.addEventListener("click", ev => this.inputEl.value !== "" && this.close(this.inputEl.value))

    let cancelBtn = el.querySelector(".js-cancel-button") as HTMLButtonElement
    cancelBtn.addEventListener("click", ev => this.close(""))

    let closeItem = el.querySelector(".js-close") as HTMLElement
    closeItem.addEventListener("click", ev => this.close(""))

    return el
  }

  private close(s: string) {
    if (this.currDfd)
      this.currDfd && this.currDfd.resolve(s)
    this.currDfd = undefined
    this.el.close()
  }
}
