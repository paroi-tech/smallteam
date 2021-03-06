import { Dash } from "bkb"
import dialogPolyfill from "dialog-polyfill"
import handledom from "handledom"
import { removeAllChildren } from "../libraries/utils"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.UncloseableDialog {
  min-width: 40%;
  padding: 50px;
  &-content {
    color: #4169e1;
  }
}
`

const template = handledom`
<dialog class="ModalDialog UncloseableDialog">
  <header class="ModalDialog-header" h="title"></header>
  <div class="UncloseableDialog-content Text" h="message"></div>
</dialog>
`

export default class UncloseableDialog {
  private readonly el: HTMLDialogElement
  private msgEl: HTMLElement
  private titleEl: HTMLElement

  constructor(private dash: Dash) {
    const { root, ref } = template()
    this.el = root as HTMLDialogElement
    this.msgEl = ref("message")
    this.titleEl = ref("title")

    dialogPolyfill.registerDialog(this.el)

    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  show(msg: string | string[], title = "") {
    this.titleEl.hidden = !title
    this.titleEl.textContent = title

    removeAllChildren(this.msgEl)
    const arr = typeof msg === "string" ? [msg] : msg
    for (const s of arr) {
      const p = document.createElement("p")
      p.textContent = s
      this.msgEl.appendChild(p)
    }

    document.body.appendChild(this.el)
    this.el.showModal()
  }

  close() {
    document.body.removeChild(this.el)
  }
}
