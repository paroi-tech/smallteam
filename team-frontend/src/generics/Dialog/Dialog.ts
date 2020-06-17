require("./_Dialog.scss")
import { Dash } from "bkb"
import handledom from "handledom"
import { removeAllChildren } from "../../../../shared-ui/libraries/utils"

const template = handledom`
<dialog class="Dialog" draggable="true">
  <div class="Dialog-box">
    <header class="Dialog-header">
      <span class="Dialog-title">{{ title }}</span>
      <button class="Dialog-closeBtn" title="Close" h="close">
        <span class="fa fa-1x fa-times"></span>
      </button>
    </header>
    <div h="body"></div>
  </div>
</dialog>
`

export type ComponentOrUndef = { el: HTMLElement } | undefined

export interface DialogOptions<C extends ComponentOrUndef> {
  title?: string
  content?: C
}

export class Dialog<C extends ComponentOrUndef = undefined> {
  readonly content: C

  private el: HTMLDialogElement
  private update: (variables: { [name: string]: any }) => void
  private bodyEl: HTMLElement
  private resolveCb?: () => void

  private lastDragStart?: DragEvent

  constructor(private dash: Dash, private options: DialogOptions<C> = {}) {
    this.content = options.content! // 'C' can be undefined
    dash.exposeEvent("open", "close")

    const { root, ref, update } = template()
    this.update = update

    this.el = root as HTMLDialogElement
    this.bodyEl = ref("body")

    ref("close").addEventListener("click", () => this.close())
    this.el.addEventListener("cancel", ev => {
      ev.preventDefault()
      this.close()
    })
    this.el.addEventListener("click", ev => {
      if (ev.target === this.el)
        this.close()
    })

    document.body.appendChild(this.el)

    dash.listenTo("destroy", () => {
      document.body.removeChild(this.el)
    })

    this.el.addEventListener("dragstart", ev => this.lastDragStart = ev)
    this.el.addEventListener("dragend", ev => {
      if (!this.lastDragStart)
        return

      let dx = ev.clientX - this.lastDragStart.clientX
      let dy = ev.clientY - this.lastDragStart.clientY
      let rect = this.el.getBoundingClientRect()
      let left = rect.left + dx
      let top = rect.top + dy

      this.el.style.position = "absolute"
      this.el.style.top = `${top}px`
      this.el.style.left = `${left}px`

      this.lastDragStart = undefined
    })
  }

  open<OC extends ComponentOrUndef = C>(options: DialogOptions<OC> = {}): Promise<void> {
    if (this.el.open || this.resolveCb)
      return Promise.resolve()

    this.update({
      title: options.title || this.options.title || ""
    })

    if (options.content) {
      removeAllChildren(this.bodyEl)
      this.bodyEl.appendChild(options.content.el)
    } else if (!this.bodyContainsDefaultEl()) {
      removeAllChildren(this.bodyEl)
      if (this.options.content)
        this.bodyEl.appendChild(this.options.content.el)
    }

    this.el.showModal()
    this.dash.emit("open")
    return new Promise(resolve => this.resolveCb = resolve)
  }

  close(): void {
    if (!this.el.open || !this.resolveCb)
      return
    this.el.close()
    if (!this.bodyContainsDefaultEl())
      removeAllChildren(this.bodyEl)
    let resolveCb = this.resolveCb
    this.resolveCb = undefined
    resolveCb()
    this.dash.emit("close")
  }

  private bodyContainsDefaultEl() {
    let children = this.bodyEl.children
    if (this.options.content)
      return children.length === 1 && children[0] === this.options.content.el
    else
      return children.length === 0
  }
}

