import Deferred from "@smallteam-local/shared-ui/libraries/Deferred"
import ErrorDialog from "@smallteam-local/shared-ui/modal-dialogs/ErrorDialog"
import WarningDialog from "@smallteam-local/shared-ui/modal-dialogs/WarningDialog"
import { Dash } from "bkb"
import dialogPolyfill from "dialog-polyfill"
import handledom from "handledom"
import App from "../AppFrame/App"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
@import "../shared-ui/theme/definitions";

.LoginDialog {
  margin: 0 auto;
  max-width: 396px;
  width: 100%;

  &::backdrop {
    background-color: transparent;
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
  }

  &-header {
    background: url("/logo-2x.png") no-repeat center center;
    background-size: contain;
    height: 107px;
    margin: 0 auto 4px;
    width: 352px;
  }

  &-box {
    background-color: white;
    box-shadow: 0 6px 20px #cccccca8;
    padding: 40px 48px 94px;
  }

  &-h1 {
    margin-bottom: 19px;
  }

  &-p {
    font-size: $f13;
    margin-top: 44px;
  }
}
`

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

export type LoginResult = SessionInfo | "password-reset"

export interface SessionInfo {
  accountId: string
  frontendId: string
}

export default class LoginDialog {
  private readonly el: HTMLDialogElement
  private nameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private curDfd: Deferred<LoginResult> | undefined
  private enabled = true

  constructor(private dash: Dash<App>) {
    const { root, ref } = template()

    this.el = root as HTMLDialogElement
    this.nameEl = ref("username")
    this.passwordEl = ref("password") as HTMLInputElement
    this.spinnerEl = ref("spinner") as HTMLElement

    dialogPolyfill.registerDialog(this.el)

    const btnEl: HTMLButtonElement = ref("submitBtn")

    btnEl.addEventListener("click", () => this.onSubmit())
    this.el.addEventListener("keyup", ev => {
      if (ev.key === "Enter" && this.enabled)
        btnEl.click()
    })
    ref("pwdReset").addEventListener("click", () => this.onPasswordReset())

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())

    document.body.appendChild(this.el)
  }

  open(): Promise<LoginResult> {
    this.el.showModal()
    this.curDfd = new Deferred()

    return this.curDfd.promise
  }

  private removeWarnings() {
    this.nameEl.style.borderColor = "gray"
    this.passwordEl.style.borderColor = "gray"
  }

  private async onSubmit() {
    this.removeWarnings()

    const login = this.nameEl.value.trim()
    const password = this.passwordEl.value
    if (login.length === 0) {
      this.nameEl.focus()
    } else if (password.length === 0) {
      this.passwordEl.focus()
    } else {
      this.enabled = false
      this.showSpinner()

      const info = await this.tryToLogin(login, password)

      this.hideSpinner()
      this.enabled = true
      if (!info || !this.curDfd)
        return

      this.el.close()
      this.curDfd.resolve(info)
      this.curDfd = undefined
    }
  }

  private onPasswordReset() {
    if (this.curDfd) {
      this.el.close()
      this.curDfd.resolve("password-reset")
      this.curDfd = undefined
    }
  }

  private async tryToLogin(login: string, password: string): Promise<SessionInfo | undefined> {
    try {
      const data = await fetch(`${this.dash.app.baseUrl}/api/session/connect`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ login, password })
      }).then(response => {
        if (!response.ok)
          throw new Error("Unable to fulfill login request")
        return response.json()
      })

      if (data.done) {
        return data.info
      } else {
        await this.dash.create(WarningDialog).show([
          "Wrong username or password."
        ])
      }
    } catch (err) {
      await this.dash.create(ErrorDialog).show([
        "Something went wrong. We could not process fulfill your request.",
        "Please, try again."
      ])
    }
  }

  private showSpinner() {
    this.spinnerEl.hidden = false
  }

  private hideSpinner() {
    this.spinnerEl.hidden = true
  }
}
