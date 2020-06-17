require("./_EditableTextField.scss")
import { Dash } from "bkb"
import handledom from "handledom"

const template = handledom`
<div class="EditableTextField">
  <input class="EditableTextField-input" type="text" disabled h="input">
  <button class="EditableTextField-button" type="button" h="btn"></button>
</div>
`

export default class EditableTextField {
  readonly el: HTMLElement
  private btnEl: HTMLElement
  private inputEl: HTMLInputElement

  constructor(private dash: Dash) {
    const { root, ref } = template()
    this.el = root
    this.btnEl = ref("btn")
    this.inputEl = ref("input")

    this.btnEl.addEventListener("click", () => {
      this.inputEl.disabled = false
      this.inputEl.focus()
    })

    this.inputEl.addEventListener("blur", () => {
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
