import Deferred from "@smallteam/shared-ui/libraries/Deferred"
import ErrorDialog from "@smallteam/shared-ui/modal-dialogs/ErrorDialog"
import InfoDialog from "@smallteam/shared-ui/modal-dialogs/InfoDialog"
import { Dash } from "bkb"
import dialogPolyfill from "dialog-polyfill"
import handledom from "handledom"
import App from "../AppFrame/App"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.PasswordRequestDialog {
  border: 1px solid saddlebrown;
  margin: 0 auto;
  width: 300px;
}
`

const template = handledom`
<dialog class="PasswordRequestDialog">
  <p>
    Please enter the email address you have been registered with.<br>
    An email with a link to reset the password will be sent to that address.
  </p>
  <div>
    <input type="email" h="email" required>
    <button class="Btn WithLoader -right" type="button" h="submit">
      Request email
      <span class="WithLoader-l" hidden h="spinner"></span>
    </button>
    <button type="button" h="cancel">Cancel</button>
  </div>
</dialog>
`

export default class PasswordRequestDialog {
  private readonly el: HTMLDialogElement
  private emailEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private curDfd: Deferred<any> | undefined

  constructor(private dash: Dash<App>) {
    const { root, ref } = template()

    this.el = root as HTMLDialogElement
    this.emailEl = ref("email")
    this.spinnerEl = ref("spinner")

    dialogPolyfill.registerDialog(this.el)

    const btnEl: HTMLButtonElement = ref("submit")

    btnEl.addEventListener("click", () => this.onSubmit())
    ref("cancel").addEventListener("click", () => this.onCancel())
    this.el.addEventListener("keyup", ev => {
      if (ev.key === "Enter")
        btnEl.click()
    })

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())

    document.body.appendChild(this.el)
  }

  open() {
    this.el.showModal()
    this.curDfd = new Deferred()

    return this.curDfd.promise
  }

  private async onSubmit() {
    this.disable()
    this.showSpinner()

    const address = this.emailEl.value

    if (address && await this.makeApiCall(address) && this.curDfd) {
      this.curDfd.resolve(undefined)
      this.curDfd = undefined
      this.el.close()
    }

    this.enable()
    this.hideSpinner()
  }

  private async makeApiCall(address: string) {
    try {
      const response = await fetch(`${this.dash.app.baseUrl}/api/registration/send-password-reset-mail`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ email: address })
      })

      if (!response.ok) {
        await this.dash.create(ErrorDialog).show("Unable to get a response from server.")
        return false
      }

      const result = await response.json()

      if (result.done) {
        const msg = "Request received by server. Your should receive an email in order to complete the process."

        await this.dash.create(InfoDialog).show(msg)
        return true
      }

      await this.dash.create(ErrorDialog).show(`There was an problem while processing your resquest.\n${result.reason}`)
    } catch (err) {
      await this.dash.create(ErrorDialog).show("There was an problem while processing your resquest.")
      this.dash.log.error("Error while requesting password reset mail", err)
    }

    return false
  }

  private onCancel() {
    if (this.curDfd) {
      this.el.close()
      this.curDfd.resolve(undefined)
      this.curDfd = undefined
    }
  }

  private enable() {
    this.el.style.pointerEvents = "auto"
  }

  private disable() {
    this.el.style.pointerEvents = "none"
  }

  private showSpinner() {
    this.spinnerEl.hidden = false
  }

  private hideSpinner() {
    this.spinnerEl.hidden = true
  }
}
