import { Dash } from "bkb"
import handledom from "handledom"

// tslint:disable-next-line: no-unused-expression
scss`
@import "../shared-ui/theme/definitions";

.EditableTextField {
  align-items: center;
  border: 1px solid #808080;
  display: flex;
  font-size: $f14;
  padding: 0 7px;

  &-input {
    border: 0;
    flex-grow: 1;
    outline: none;
    height: 34px;
    line-height: 32px;
  }

  &-button {
    background-image: url(svg/feather/edit.svg);
    background-position: center;
    background-size: cover;
    border: 0;
    flex-grow: 0;
    height: 16px;
    margin: 0 4px;
    outline: none;
    width: 16px;
  }
}
`

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
