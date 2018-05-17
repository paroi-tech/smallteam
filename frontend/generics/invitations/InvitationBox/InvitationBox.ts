import { render } from "@fabtom/lt-monkberry"
import { OwnDash } from "../../../App/OwnDash"
import { Box } from "../../../generics/BoxList/BoxList"

const template = require("./InvitationBox.monk")

export default class StepBox implements Box {
  readonly el: HTMLElement
  private spanEl: HTMLElement

  constructor(private dash: OwnDash, readonly invitation: Invitation) {
    let view = render(template)
    this.el = view.rootEl()
    this.spanEl = view.ref("span")
    this.spanEl.textContent = this.invitation.email
  }

  get id(): string {
    return this.invitation.id
  }

  public setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }
}
