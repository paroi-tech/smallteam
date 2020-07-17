import { removeAllChildren } from "@smallteam-local/shared-ui/libraries/utils"
import { Dash } from "bkb"
import dialogPolyfill from "dialog-polyfill"
import handledom from "handledom"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.Dialog {
  &-box {
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);
    min-width: 500px;
  }

  &::backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
  }

  &-header {
    align-content: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 4px;
  }

  &-title {
    flex-grow: 1;
    text-align: center;
  }

  &-closeBtn {
    color: black;
    &:hover {
      color: red;
    }
    &:focus {
      outline: none;
    }
  }
}
`

const template = handledom`
<dialog class="Dialog" draggable="true">
  <div class="Dialog-box">
    <header class="Dialog-header">
      <span class="Dialog-title">{{ title }}</span>
      <button class="Dialog-closeBtn" title="Close" h="close">×</button>
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

    dialogPolyfill.registerDialog(this.el)

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

      const dx = ev.clientX - this.lastDragStart.clientX
      const dy = ev.clientY - this.lastDragStart.clientY
      const rect = this.el.getBoundingClientRect()
      const left = rect.left + dx
      const top = rect.top + dy

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
    const resolveCb = this.resolveCb
    this.resolveCb = undefined
    resolveCb()
    this.dash.emit("close")
  }

  private bodyContainsDefaultEl() {
    const children = this.bodyEl.children
    if (this.options.content)
      return children.length === 1 && children[0] === this.options.content.el
    else
      return children.length === 0
  }
}

