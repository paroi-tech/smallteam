import { Dash } from "bkb"
import handledom from "handledom"
import { ErrorDialog, WarningDialog } from "../../../../../shared-ui/modalDialogs/modalDialogs"
import App from "../../../App/App"

const template = handledom`
<div class="FieldGroup">
  <label class="FieldGroup-item Field">
    <span class="Field-lbl">Email</span>
    <input class="Field-input" type="text" placeholder="Email" h="email">
  </label>

  <label class="FieldGroup-item Field">
    <span class="Field-lbl">Username</span>
    <input class="Field-input" type="text" placeholder="Username" h="username">
  </label>

  <label class="FieldGroup-item Field">
    <span class="Field-lbl">Invitation validity</span>
    <span class="Field-deco">
      <input class="Field-input" type="number" step="1" min="1" max="30" pattern="\d+" placeholder="Days" h="validity">
    </span>
  </label>

  <button class="FieldGroup-action Btn WithLoader -right" h="submitBtn" type="button">
    Submit
    <span class="WithLoader-l" h="spinner"></span>
  </button>
</div>
`

export default class InvitationForm {
  readonly el: HTMLElement
  private usernameEl: HTMLInputElement
  private emailEl: HTMLInputElement
  private validityEl: HTMLInputElement
  private spinnerEl: HTMLElement

  constructor(private dash: Dash<App>) {
    const { root, ref } = template()
    this.el = root
    this.usernameEl = ref("username")
    this.emailEl = ref("email")
    this.validityEl = ref("validity")
    this.spinnerEl = ref("spinner")
    ref("submitBtn").addEventListener("click", () => this.onSubmit())
  }

  private async onSubmit() {
    let username = this.usernameEl.value.trim()
    let email = this.emailEl.value
    let validity = this.validityEl.value
    if (!this.validate(username, email, validity)) {
      await this.dash.create(WarningDialog).show("Please check the values you type in the form.")
      return
    }
    await this.doFetch(username || undefined, email, validity)
  }

  private async doFetch(username: string | undefined, email: string, validity) {
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/registration/send-invitation`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ username, email, validity })
      })
      if (response.ok)
        return this.handleFetchResult(await response.json())
      else
        await this.dash.create(ErrorDialog).show(`The server does not handle your request: ${response.status} code.`)
    } catch (error) {
      await this.dash.create(ErrorDialog).show("Unable to complete the task. Network Error.")
    }
  }

  private async handleFetchResult(data) {
    if (!data.done) {
      await this.dash.create(ErrorDialog).show(`The server does not fulfill your request for an unknown reason.`)
      return
    }
    this.clear()
    // FIXME: In future, this event will be received via websocket.
    this.dash.emit("invitationSent", data.invitation)
  }

  private validate(username: string, email: string, validity: string) {
    if (username !== "" && (username.length < 4 || username.length > 30))
      return false
    if (email === "")
      return false
    let n = parseInt(validity)
    if (n <= 0 || n > 30)
      return false
    return true
  }

  private clear() {
    this.usernameEl.value = ""
    this.emailEl.value = ""
    this.validityEl.value = "1"
  }
}
