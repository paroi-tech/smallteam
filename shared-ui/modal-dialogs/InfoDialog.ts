import { Dash } from "bkb"
import dialogPolyfill from "dialog-polyfill"
import handledom from "handledom"
import Deferred from "../libraries/Deferred"
import { makeOutsideClickHandlerFor, removeAllChildren } from "../libraries/utils"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.InfoDialog {
  &-contentLeft {
    color: #4169e1;
  }
}
`

const template = handledom`
<dialog class="ModalDialog InfoDialog">
  <header class="ModalDialog-header">
    <div class="ModalDialog-headerLeft">
      <span h="title"></span>
    </div>
    <div class="ModalDialog-headerRight">
      <span class="fas fa-times fa-1x ModalDialogCloseItem" h="close"></span>
    </div>
  </header>

  <div class="ModalDialog-content">
    <div class="ModalDialog-contentLeft InfoDialog-contentLeft">
      <span class="fas fa-3x fa-info-circle"></span>
    </div>
    <div class="ModalDialog-contentRight">
      <div h="message"></div>
    </div>
  </div>

  <div class="ModalDialog-bottom">
    <button class="ModalDialogOkButton" h="button">OK</button>
  </div>
</dialog>
`

export default class InfoDialog {
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

    let closeCb = () => this.close()

    ref("button").addEventListener("click", closeCb)
    ref("close").addEventListener("click", closeCb)
    this.el.addEventListener("cancel", ev => {
      ev.preventDefault()
      this.close()
    })
    this.el.addEventListener("keydown", ev => {
      if (ev.key === "Enter") {
        ev.stopPropagation()
        this.close()
      }
    })

  }

  show(msg: string | string[], title = "Information"): Promise<boolean> {
    this.currDfd = new Deferred()
    this.titleEl.textContent = title

    removeAllChildren(this.msgEl)
    let arr = typeof msg === "string" ? [msg] : msg
    for (let s of arr) {
      let p = document.createElement("p")
      p.textContent = s
      this.msgEl.appendChild(p)
    }

    document.body.appendChild(this.el)
    makeOutsideClickHandlerFor(this.el, () => this.close())
    this.el.showModal()

    return this.currDfd.promise
  }

  private close() {
    if (this.currDfd)
      this.currDfd.resolve(true)
    this.currDfd = undefined
    this.el.close()
    document.body.removeChild(this.el)
  }
}
