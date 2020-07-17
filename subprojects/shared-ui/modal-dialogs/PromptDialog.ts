import { Dash } from "bkb"
import dialogPolyfill from "dialog-polyfill"
import handledom from "handledom"
import Deferred from "../libraries/Deferred"
import { makeOutsideClickHandlerFor, removeAllChildren } from "../libraries/utils"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.PromptDialog {
  &-contentLeft {
      color: #708090;
  }

  &-contentRight {
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      padding-right: 5px;
  }

  &-input {
    display: block;
    border: 1px solid #2f4f4f;
    padding: 3px;
    width: 100%;
  }
}
`

const template = handledom`
<dialog class="PromptDialog InfoDialog">
  <header class="InfoDialog-header">
    <div class="InfoDialog-headerLeft">
      <span h="title"></span>
    </div>
    <div class="InfoDialog-headerRight">
      <span class="ModalDialogCloseItem" h="close">×</span>
    </div>
  </header>

  <div class="ModalDialog-content">
    <div class="PromptDialog-contentLeft">
      <span class="fas fa-3x fa-edit"></span>
    </div>
    <div class="PromptDialog-contentRight">
      <div h="message"></div>
      <input type="text" class="PromptDialog-input" h="input">
    </div>
  </div>

  <div class="InfoDialog-bottom">
    <button class="ModalDialogCancelButton" h="cancelBtn">Cancel</button>
    <pre>&nbsp;</pre>
    <button class="ModalDialogOkButton" h="okBtn">OK</button>
  </div>
</dialog>
`

export default class PromptDialog {
  private readonly el: HTMLDialogElement
  private msgEl: HTMLElement
  private titleEl: HTMLElement
  private inputEl: HTMLInputElement

  private currDfd: Deferred<string> | undefined

  constructor(private dash: Dash) {
    const { root, ref } = template()

    this.el = root as HTMLDialogElement
    this.msgEl = ref("message")
    this.titleEl = ref("title")
    this.inputEl = ref("input")

    dialogPolyfill.registerDialog(this.el)

    const closeCb = () => this.close("")

    ref("cancelBtn").addEventListener("click", closeCb)
    ref("close").addEventListener("click", closeCb)
    ref("okBtn").addEventListener("click", () => {
      if (this.inputEl.value !== "")
        this.close(this.inputEl.value)
    })
    this.el.addEventListener("cancel", ev => {
      ev.preventDefault()
      this.close("")
    })
    this.el.addEventListener("keydown", ev => {
      if (ev.key === "Enter" && this.inputEl.value !== "")
        this.close(this.inputEl.value)
    })
  }

  show(msg: string | string[], title = "Prompt"): Promise<string> {
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
    makeOutsideClickHandlerFor(this.el, () => this.close(""))
    this.el.showModal()

    return this.currDfd.promise
  }

  private close(s: string) {
    if (this.currDfd)
      this.currDfd.resolve(s)
    this.currDfd = undefined
    this.el.close()
    document.body.removeChild(this.el)
  }
}
