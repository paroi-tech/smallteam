import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { Box } from "../../generics/BoxList"
import { Invitation } from "./InvitationWorkspace"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.InvitationBox {
  width: 180px;

  &-bottom {
    display: flex;
    justify-content: flex-end;

    > span {
      margin: 4px;
    }
  }

  &-lbl {
    margin-left: 4px;
  }
}
`

const template = handledom`
<div class="InvitationBox">
  <div class="InvitationBox-top">
    <section>
      <span>✉</span>
      <span class="InvitationBox-lbl" h="email"></span>
    </section>
    <section>
      <span>👤</span>
      <span class="InvitationBox-lbl" h="username"></span>
    </section>
    <section>
      <span style="color: green">🕐</span>
      <span class="InvitationBox-lbl" h="creation"></span>
    </section>
    <section>
      <span style="color: red">🕐</span>
      <span class="InvitationBox-lbl" h="expiration"></span>
    </section>
  </div>

  <div class="InvitationBox-bottom">
    <span title="Resend invitation" h="resend">🔁</span>
    <span title="Cancel invitation" h="cancel">🗑</span>
  </div>
</div>
`

export default class InvitationBox implements Box {
  readonly el: HTMLElement

  constructor(private dash: OwnDash, readonly invitation: Invitation) {
    const { root, ref } = template()

    this.el = root

    ref("email").textContent = this.invitation.email
    ref("username").textContent = this.invitation.username || "<not defined>"
    ref("creation").textContent = new Date(this.invitation.creationTs).toDateString()
    ref("expiration").textContent = new Date(this.invitation.expirationTs).toDateString()

    ref("resend").addEventListener("click", () => this.dash.emit("resendInvitation", this.invitation.id))
    ref("cancel").addEventListener("click", () => this.dash.emit("cancelInvitation", this.invitation.id))
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
