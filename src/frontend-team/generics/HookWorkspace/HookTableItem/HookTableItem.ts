import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"
import { HookModel } from "../HookWorkspace"
import { Log } from "bkb"

const template = require("./HookTableItem.monk")

export default class HookTableItem {
  readonly el: HTMLElement
  private providerEl: HTMLElement
  private urlEl: HTMLElement
  private btnSecretEl: HTMLButtonElement
  private btnToggleEl: HTMLButtonElement
  private btnDeleteEl: HTMLButtonElement

  private log: Log

  constructor(private dash: OwnDash, readonly hook: HookModel) {
    this.log = this.dash.log
    let view = render(template)

    this.el = view.rootEl()
    this.providerEl = view.ref("provider")
    this.urlEl = view.ref("url")
    this.btnSecretEl = view.ref("secret")
    this.btnToggleEl = view.ref("toggle")
    this.btnDeleteEl = view.ref("delete")

    this.providerEl.textContent = this.hook.provider
    this.urlEl.textContent = this.hook.url
    this.btnToggleEl.textContent = this.hook.active ? "Deactivate" : "Activate"

    this.btnDeleteEl.addEventListener("click", ev => {

    })
    this.btnSecretEl.addEventListener("click", ev => {})
    this.btnToggleEl.addEventListener("click", ev => {})
  }

  private showHookSecret() {
    if (this.hook.inProcessing) {
      this.log.info("Cannot perform this action now...")
      return
    }
    this.hook.inProcessing = true
    this.hook.inProcessing = false
  }

  private toggleHook() {
    if (this.hook.inProcessing) {
      this.log.info("Cannot perform this action now...")
      return
    }
    this.hook.inProcessing = true
    this.hook.inProcessing = false
  }

  private deleteHook() {
    if (this.hook.inProcessing) {
      this.log.info("Cannot perform this action now...")
      return
    }
    this.hook.inProcessing = true
    this.hook.inProcessing = false
  }
}
