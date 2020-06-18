require("./_LoginDialog.scss")
import { Dash } from "bkb"
import dialogPolyfill from "dialog-polyfill"
import handledom from "handledom"
import Deferred from "../../../../shared-ui/libraries/Deferred"
import { ErrorDialog, WarningDialog } from "../../../../shared-ui/modalDialogs/modalDialogs"
import App from "../../App/App"

const template = handledom`
<dialog class="LoginDialog">
  <header class="LoginDialog-header"></header>

  <main class="LoginDialog-box">
    <h1 class="LoginDialog-h1 SimpleTitle">Login to your account</h1>

    <div class="FieldGroup">
      <label class="FieldGroup-item Field">
        <span class="Field-deco -icon -profile -leftBlue">
          <input class="Field-input" h="username" type="text" placeholder="Username">
        </span>
      </label>
      <label class="FieldGroup-item -gap Field">
        <span class="Field-deco -icon -lock -leftBlue">
          <input class="Field-input" h="password" type="password" placeholder="Password">
        </span>
      </label>
      <button class="FieldGroup-action Btn WithLoader -right" h="submitBtn" type="button">
        Submit
        <span class="WithLoader-l" hidden h="spinner"></span>
      </button>
    </div>

    <p class="LoginDialog-p Text">Forgot your password? <a href="#" h="pwdReset">Click here</a>.</p>
  </main>
</dialog>
`

export default class LoginDialog {
  private readonly el: HTMLDialogElement
  private nameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private curDfd: Deferred<string> | undefined
  private enabled = true

  constructor(private dash: Dash<App>) {
    const { root, ref } = template()

    this.el = root as HTMLDialogElement
    this.nameEl = ref("username")
    this.passwordEl = ref("password") as HTMLInputElement
    this.spinnerEl = ref("spinner") as HTMLElement

    let btnEl: HTMLButtonElement = ref("submitBtn")

    btnEl.addEventListener("click", () => this.onSubmit())
    this.el.addEventListener("keyup", ev => {
      if (ev.key === "Enter" && this.enabled)
        btnEl.click()
    })
    ref("pwdReset").addEventListener("click", () => this.onPasswordReset())

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())

    dialogPolyfill.registerDialog(this.el)
    document.body.appendChild(this.el)
  }

  open(): Promise<string> {
    this.el.showModal()
    this.curDfd = new Deferred()

    return this.curDfd.promise
  }

  private removeWarnings() {
    this.nameEl.style.borderColor = "gray"
    this.passwordEl.style.borderColor = "gray"
  }

  private async onSubmit() {
    this.enabled = false
    this.removeWarnings()
    this.showSpinner()

    let login = this.nameEl.value.trim()
    let password = this.passwordEl.value
    let accountId = await this.tryToLogin(login, password)

    this.hideSpinner()
    if (accountId && this.curDfd) {
      this.el.close()
      this.curDfd.resolve(accountId)
      this.curDfd = undefined
    }
    this.enabled = true
  }

  private onPasswordReset() {
    if (this.curDfd) {
      this.el.close()
      this.curDfd.resolve("resetPassword")
      this.curDfd = undefined
    }
  }

  private async tryToLogin(login: string, password: string): Promise<string | undefined> {
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/session/connect`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ login, password })
      })

      if (!response.ok) {
        await this.handleRequestError(response)
        return undefined
      }

      let result = await response.json()

      if (result.done) {
        let accountId = result.accountId as string
        return accountId
      }
      await this.dash.create(WarningDialog).show("Wrong username or password.")
    } catch (err) {
      await this.dash.create(ErrorDialog).show("There was an problem while processing your resquest.")
      this.dash.log.error(err)
    }

    return undefined
  }

  private async handleRequestError(response: Response) {
    if (response.status === 400) {
      let data = await response.json()
      await this.dash.create(WarningDialog).show(`Your request was not processed. ${data.error}`)
    } else if (response.status === 500)
      await this.dash.create(ErrorDialog).show("The server could not process your request.")
    else
      await this.dash.create(ErrorDialog).show("Unable to get a response from server.")
  }

  private showSpinner() {
    this.spinnerEl.hidden = false
  }

  private hideSpinner() {
    this.spinnerEl.hidden = true
  }
}
