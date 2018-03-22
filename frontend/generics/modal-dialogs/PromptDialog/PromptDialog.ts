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
    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLDialogElement
    this.el.addEventListener("cancel", ev => {
      ev.preventDefault()
      this.close("")
    })
    this.el.addEventListener("keydown", ev => {
      if (ev.key === "Enter" && this.inputEl.value !== "")
        this.close(this.inputEl.value)
    })
    this.msgEl = this.el.querySelector(".js-message") as HTMLElement
    this.titleEl = this.el.querySelector(".js-title") as HTMLElement
    this.inputEl = this.el.querySelector(".js-input") as HTMLInputElement

    let okBtn = this.el.querySelector(".js-ok-button") as HTMLButtonElement
    let cancelBtn = this.el.querySelector(".js-cancel-button") as HTMLButtonElement
    let closeItem = this.el.querySelector(".js-close") as HTMLElement
    okBtn.addEventListener("click", ev => this.inputEl.value !== "" && this.close(this.inputEl.value))
    cancelBtn.addEventListener("click", ev => this.close(""))
    closeItem.addEventListener("click", ev => this.close(""))
  }

  public show(msg: string, title = "Prompt"): Promise<string> {
    this.currDfd = new Deferred()
    this.msgEl.textContent = msg
    this.titleEl.textContent = title
    document.body.appendChild(this.el)
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
