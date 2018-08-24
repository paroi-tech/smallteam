import { OwnDash } from "../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"

export interface HookModel {
  id: string
  uid: string
  provider: string
  active: string
}

const template = require("./HookWorkspace.monk")

export default class HookWorkspace {
  readonly el: HTMLElement
  private tableEl: HTMLTableElement

  constructor(private dash: OwnDash) {
    let view = render(template)

    this.el = view.rootEl()
    this.tableEl = view.ref("table")
  }

  private fetchHooks() {

  }
}
