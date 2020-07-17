import { Dash } from "bkb"
import dialogPolyfill from "dialog-polyfill"
import handledom from "handledom"
import Deferred from "../libraries/Deferred"
import { makeOutsideClickHandlerFor, removeAllChildren } from "../libraries/utils"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.QuestionDialog {
  &-contentLeft {
    color: #0000ff;
  }
}
`

const template = handledom`
<dialog class="ModalDialog QuestionDialog">
  <header class="ModalDialog-header">
    <div class="ModalDialog-headerLeft">
      <span h="title"></span>
    </div>
    <div class="ModalDialog-headerRight">
        <span class="ModalDialogCloseItem" h="close">×</span>
    </div>
  </header>

  <div class="ModalDialog-content">
    <div class="ModalDialog-contentLeft InfoDialog-contentLeft">
      <span class="CircleChar">?</span>
    </div>
    <div class="ModalDialog-contentRight">
      <div h="message"></div>
    </div>
  </div>

  <div class="ModalDialog-bottom">
    <button class="ModalDialogCancelButton" h="cancelBtn">No</button>
    <pre>&nbsp;</pre>
    <button class="ModalDialogOkButton" h="okBtn">Yes</button>
  </div>
</dialog>
`

export default class QuestionDialog {
  private readonly el: HTMLDialogElement
  private msgEl: HTMLElement
  private titleEl: HTMLElement

  private currDfd: Deferred<boolean> | undefined

  constructor(private dash: Dash) {
    const { root, ref } = template()

    this.el = root as HTMLDialogElement
    this.msgEl = ref("message")
    this.titleEl = ref("title")

    dialogPolyfill.registerDialog(this.el)

    ref("okBtn").addEventListener("click", () => this.close(true))
    ref("cancelBtn").addEventListener("click", () => this.close(false))
    ref("close").addEventListener("click", () => this.close(false))

    this.el.addEventListener("cancel", ev => {
      ev.preventDefault()
      this.close(false)
    })
    this.el.addEventListener("keydown", ev => {
      if (ev.key === "Enter")
        this.close(true)
    })

  }

  show(msg: string | string[], title = "Question"): Promise<boolean> {
    this.currDfd = new Deferred()
    this.titleEl.textContent = title

    removeAllChildren(this.msgEl)
    const arr = typeof msg === "string" ? [msg] : msg
    for (const s of arr) {
      const p = document.createElement("p")
      p.textContent = s
      this.msgEl.appendChild(p)
    }

    document.body.appendChild(this.el)
    makeOutsideClickHandlerFor(this.el, () => this.close(false))
    this.el.showModal()

    return this.currDfd.promise
  }

  private close(b: boolean) {
    if (this.currDfd)
      this.currDfd.resolve(b)
    this.currDfd = undefined
    this.el.close()
    document.body.removeChild(this.el)
  }
}
