import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"

import template = require("./EditableTextField.monk")

export default class EditableTextField {
  readonly el: HTMLElement
  private btnEl: HTMLElement
  private inputEl: HTMLInputElement

  constructor(private dash: Dash) {
    let view = render(template)
    this.el = view.rootEl()
    this.btnEl = view.ref("btn")
    this.inputEl = view.ref("input")

    this.btnEl.addEventListener("click", ev => {
      this.inputEl.disabled = false
      this.inputEl.focus()
    })

    this.inputEl.addEventListener("blur", ev => {
      this.inputEl.disabled = true
      this.dash.emit("focusout", this.inputEl.value)
    })
  }

  reset() {
    this.inputEl.disabled = true
    this.inputEl.value = ""
  }

  get value() {
    return this.inputEl.value
  }

  set value(str: string) {
    this.inputEl.value = str
  }
}
