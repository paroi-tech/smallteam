import handledom from "handledom"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.PasswordEdit {
  display: flex;
  flex-direction: column;
}
`

const template = handledom`
<div class="PasswordEdit FieldGroup">
    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Password</span>
      <input class="Field-input" type="password" h="primary">
    </label>

    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Confirm password</span>
      <input class="Field-input" type="password" h="confirm">
    </label>
</div>
`

export default class PasswordEdit {
  readonly el: HTMLDivElement
  private primaryEl: HTMLInputElement
  private confirmEl: HTMLInputElement

  constructor() {
    const { root, ref } = template()
    this.el = root as HTMLDivElement
    this.primaryEl = ref("primary")
    this.confirmEl = ref("confirm")
  }

  focus() {
    this.primaryEl.focus()
  }

  clear() {
    this.primaryEl.value = ""
    this.confirmEl.value = ""
  }

  passwordsMatch(): boolean {
    return this.confirmEl.value === this.primaryEl.value
  }

  getPasswordIfMatch(): string | undefined {
    const primary = this.primaryEl.value
    const confirm = this.confirmEl.value

    return primary === confirm ? primary : undefined
  }

  getPassword(): string {
    return this.primaryEl.value
  }

  hasPassword() {
    return this.getPassword() !== ""
  }
}
