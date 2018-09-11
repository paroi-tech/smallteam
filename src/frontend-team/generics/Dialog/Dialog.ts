import { render, LtMonkberryView } from "@fabtom/lt-monkberry"
import { removeAllChildren } from "../../../sharedFrontend/libraries/utils"
import { Dash } from "bkb"

import template = require("./Dialog.monk")

export type ComponentOrUndef = { el: HTMLElement } | undefined

export interface DialogOptions<C extends ComponentOrUndef> {
  title?: string
  content?: C
}

export class Dialog<C extends ComponentOrUndef = undefined> {
  readonly content: C

  private el: HTMLDialogElement
  private view: LtMonkberryView
  private bodyEl: HTMLElement
  private resolveCb?: () => void

  constructor(private dash: Dash, private options: DialogOptions<C> = {}) {
    this.content = options.content! // 'C' can be undefined
    dash.exposeEvent("open", "close")

    this.view = render(template)
    this.el = this.view.rootEl()
    this.bodyEl = this.view.ref("body")

    this.view.ref("close").addEventListener("click", () => this.close())
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
  }

  open<OC extends ComponentOrUndef = C>(options: DialogOptions<OC> = {}): Promise<void> {
    if (this.el.open || this.resolveCb)
      return Promise.resolve()

    this.view.update({
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

