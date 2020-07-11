import RegistrationForm from "@smallteam-local/shared-ui/components/RegistrationForm"
import { AppDash, Log, LogEvent } from "bkb"
import PasswordResetDialog from "./PasswordResetDialog"

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
    this.baseUrl = document.documentElement!.dataset.baseUrl || ""

    const env = document.documentElement.dataset.env ?? "prod"

    this.dash.listenTo<LogEvent>("log", data => {
      if (!console)
        return
      if (env === "local" || data.level === "error" || data.level === "warn") {
        // eslint-disable-next-line no-console
        if (console[data.level]) {
          // eslint-disable-next-line no-console
          console[data.level](...data.messages)
        } else {
          // eslint-disable-next-line no-console
          console.log(`[${data.level}]`, ...data.messages)
        }
      }
    })
  }

  start() {
    if (this.params.action === "passwordreset")
      this.handlePasswordReset()
    else if (this.params.action === "registration")
      void this.handleUserRegistration()
    else
      throw new Error(`Unknown action: ${this.params.action}`)
  }

  private handlePasswordReset() {
    if (!this.params.accountId)
      throw new Error("User ID not provided")
    const dialog = this.dash.create(PasswordResetDialog, {
      accountId: this.params.accountId,
      token: this.params.token
    })
    dialog.open()
  }

  private async handleUserRegistration() {
    const dialog = this.dash.create(RegistrationForm, {
      token: this.params.token,
      username: this.params.username
    })
    // In case of successful registration, we redirect user to login page.
    if (await dialog.open())
      window.location.href = `${this.baseUrl}/`
  }
}
