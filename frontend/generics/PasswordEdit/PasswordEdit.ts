import { render } from "@fabtom/lt-monkberry"

const template = require("./PasswordEdit.monk")

export default class PasswordEdit {
  readonly el: HTMLDialogElement
  private primaryEl: HTMLInputElement
  private confirmEl: HTMLInputElement

  constructor() {
    let view = render(template)
    this.el = view.rootEl()
    this.primaryEl = view.ref("primary")
    this.confirmEl = view.ref("confirm")
  }

  focus() {
    this.primaryEl.focus()
  }

  clear() {
    this.primaryEl.value = ""
    this.confirmEl.value = ""
  }

  passwordsMatch(): boolean {
    return this.confirmEl.value.trim() === this.primaryEl.value.trim()
  }

  getPasswordIfMatch(): string | undefined {
    let primary = this.primaryEl.value.trim()
    let confirm = this.confirmEl.value.trim()
    return primary === confirm ? primary : undefined
  }

  getPassword(): string {
    return this.primaryEl.value.trim()
  }

  hasPassword() {
    return this.getPassword() !== ""
  }
}