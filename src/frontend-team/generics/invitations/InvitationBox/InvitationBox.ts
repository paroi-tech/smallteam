import { render } from "@fabtom/lt-monkberry"
import { OwnDash } from "../../../App/OwnDash"
import { Box } from "../../../generics/BoxList/BoxList"
import { Invitation } from "../InvitationWorkspace/InvitationWorkspace"

const template = require("./InvitationBox.monk")

export default class StepBox implements Box {
  readonly el: HTMLElement

  constructor(private dash: OwnDash, readonly invitation: Invitation) {
    let view = render(template)

    this.el = view.rootEl()

    view.ref("email").textContent = this.invitation.email
    view.ref("username").textContent = this.invitation.username || "<not defined>"
    view.ref("creation").textContent = new Date(this.invitation.creationTs).toDateString()
    view.ref("expiration").textContent = new Date(this.invitation.expirationTs).toDateString()

    view.ref("resend").addEventListener("click", () => this.dash.emit("resendInvitation", this.invitation.id))
    view.ref("cancel").addEventListener("click", () => this.dash.emit("cancelInvitation", this.invitation.id))
  }

  get id(): string {
    return this.invitation.id
  }

  setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }
}
