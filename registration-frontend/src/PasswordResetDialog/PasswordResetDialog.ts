require("./_PasswordResetDialog.scss")
import { Dash } from "bkb"
import dialogPolyfill from "dialog-polyfill"
import handledom from "handledom"
import PasswordEdit from "../../../shared-ui/components/PasswordEdit"
import ErrorDialog from "../../../shared-ui/modal-dialogs/ErrorDialog"
import InfoDialog from "../../../shared-ui/modal-dialogs/InfoDialog"
import { whyNewPasswordIsInvalid } from "../../../shared/libraries/helpers"
import App from "../App/App"

const template = handledom`
<dialog class="PasswordResetDialog">
  <header class="PasswordResetDialog-header">Password change</header>
  <div h="container"></div>
  <div class="PasswordResetDialog-div">
    <button class="Btn WithLoader -right" type="button" h="submitBtn">
      Submit
      <span class="WithLoader-l" hidden h="spinner"></span>
    </button>
  </div>
</dialog>
`

export interface PasswordResetDialogOptions {
  accountId: string
  token: string
}

export default class PasswordResetDialog {
  readonly el: HTMLDialogElement
  private spinnerEl: HTMLElement

  private edit: PasswordEdit

  constructor(private dash: Dash<App>, private options: PasswordResetDialogOptions) {
    const { root, ref } = template()

    this.el = root as HTMLDialogElement
    dialogPolyfill.registerDialog(this.el)
    this.spinnerEl = ref("spinner")

    this.edit = this.dash.create(PasswordEdit)
    ref("container").appendChild(this.edit.el)

    let btnEl: HTMLButtonElement = ref("submitBtn")

    btnEl.addEventListener("click", () => this.onSubmit())
    this.el.addEventListener("keyup", (ev: KeyboardEvent) => {
      if (ev.key === "Enter")
        this.onSubmit()
    })

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  open() {
    document.body.appendChild(this.el)
    this.el.showModal()
  }

  private async onSubmit() {
    let password = this.edit.getPasswordIfMatch()

    if (password === undefined) {
      await this.dash.create(InfoDialog).show("Passwords do not match.")
      this.edit.focus()
      return
    }

    let checkMsg = whyNewPasswordIsInvalid(password)

    if (checkMsg) {
      await this.dash.create(InfoDialog).show(checkMsg)
      this.edit.focus()
      return
    }

    this.spinnerEl.hidden = false
    await this.doPasswordChange(password)
    this.spinnerEl.hidden = true
  }

  private async doPasswordChange(password: string) {
    try {
      if (await this.doFetch(password)) {
        let fn = () => window.location.href = `${this.dash.app.baseUrl}/`
        setTimeout(fn, 4000)
        await this.dash.create(InfoDialog).show("Password changed. You will be redirected to the login page.")
      }
    } catch (err) {
      await this.dash.create(ErrorDialog).show("Impossible to change the password. Error on server.")
      this.dash.app.log.warn(err)
    }
  }

  private async doFetch(password: string) {
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/registration/reset-password`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          accountId: this.options.accountId,
          token: this.options.token,
          password
        })
      })

      if (!response.ok) {
        await this.dash.create(ErrorDialog).show("Unable to get a response from server.")
        return false
      }

      let data = await response.json()

      if (!data.done) {
        await this.dash.create(InfoDialog).show(`Sorry. Impossible to change your password. ${data.reason}`)
        return false
      }
    } catch (err) {
      await this.dash.create(ErrorDialog).show("Impossible to change the password. Error on server.")
      return false
    }

    return true
  }
}
