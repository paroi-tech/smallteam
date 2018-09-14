import { AppDash, Log, LogEvent } from "bkb"
import RegistrationForm from "../../sharedFrontend/RegistrationForm/RegistrationForm"
import PasswordResetDialog from "../PasswordResetDialog/PasswordResetDialog"

export interface AppParams {
  action: string
  token: string
  accountId?: string
  username?: string
}

export default class App {
  readonly log: Log
  readonly baseUrl: string

  constructor(private dash: AppDash<App>, private params: AppParams) {
    this.log = dash.log
    this.baseUrl = document.documentElement.dataset.baseUrl || ""
    this.dash.listenTo<LogEvent>("log", data => {
      console.log(`[${data.level}]`, ...data.messages)
    })
  }

  start() {
    if (this.params.action === "passwordreset")
      this.handlePasswordReset()
    else if (this.params.action === "registration")
      this.handleUserRegistration()
    else
      throw new Error(`Unknown action: ${this.params.action}`)
  }

  private handlePasswordReset() {
    if (!this.params.accountId)
        throw new Error("User ID not provided")
    let dialog = this.dash.create(PasswordResetDialog, {
      accountId: this.params.accountId,
      token: this.params.token
    })
    dialog.open()
  }

  private async handleUserRegistration() {
    let dialog = this.dash.create(RegistrationForm, {
      token: this.params.token,
      username: this.params.username
    })
    // In case of successful registration, we redirect user to login page.
    if (await dialog.open())
      window.location.href = `${this.baseUrl}/`
  }
}
