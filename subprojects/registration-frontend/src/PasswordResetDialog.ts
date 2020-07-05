import PasswordEdit from "@smallteam/shared-ui/components/PasswordEdit"
import ErrorDialog from "@smallteam/shared-ui/modal-dialogs/ErrorDialog"
import InfoDialog from "@smallteam/shared-ui/modal-dialogs/InfoDialog"
import { whyNewPasswordIsInvalid } from "@smallteam/shared/dist/libraries/helpers"
import { Dash } from "bkb"
import dialogPolyfill from "dialog-polyfill"
import handledom from "handledom"
import App from "./App"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.PasswordResetDialog {
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);
  margin: 50px auto 0px;
  padding: 10px;

  &::backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }

  &-div {
    margin: 10px 0px 0px;
    text-align: right;
  }

  &-header {
    font-weight: bold;
    text-align: center;
  }
}
`

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

    const btnEl: HTMLButtonElement = ref("submitBtn")

    btnEl.addEventListener("click", () => this.onSubmit())
    this.el.addEventListener("keyup", (ev: KeyboardEvent) => {
      if (ev.key === "Enter")
        this.onSubmit().catch(err => this.dash.log.error(err))
    })

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  open() {
    document.body.appendChild(this.el)
    this.el.showModal()
  }

  private async onSubmit() {
    const password = this.edit.getPasswordIfMatch()

    if (password === undefined) {
      await this.dash.create(InfoDialog).show("Passwords do not match.")
      this.edit.focus()
      return
    }

    const checkMsg = whyNewPasswordIsInvalid(password)

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
        const fn = () => window.location.href = `${this.dash.app.baseUrl}/`
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
      const response = await fetch(`${this.dash.app.baseUrl}/api/registration/reset-password`, {
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

      const data = await response.json()

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
