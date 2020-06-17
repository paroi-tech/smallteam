require("./_QuestionDialog.scss")
import { Dash } from "bkb"
import handledom from "handledom"
import Deferred from "../../libraries/Deferred"
import { makeOutsideClickHandlerFor } from "../../libraries/utils"

const template = handledom`
<dialog class="ModalDialog QuestionDialog">
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
      <span class="fas fa-3x fa-question-circle"></span>
    </div>
    <div class="ModalDialog-contentRight">
      <p h="message"></p>
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

  show(msg: string, title = "Question"): Promise<boolean> {
    this.currDfd = new Deferred()
    this.msgEl.textContent = msg
    this.titleEl.textContent = title

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
