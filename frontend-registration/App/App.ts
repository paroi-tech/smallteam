import { AppDash, Log, LogEvent } from "bkb"
import PasswordResetDialog from "../PasswordResetDialog/PasswordResetDialog"
import RegistrationForm from "../../frontend/generics/invitations/RegistrationForm/RegistrationForm"
import config from "../../isomorphic/config"

export default class App {
  readonly log: Log

  constructor(private dash: AppDash<App>, private action: string, private token: string, private contributorId: string) {
    this.log = dash.log
    this.dash.listenTo<LogEvent>("log", data => {
      console.log(`[${data.level}]`, ...data.messages)
    })
  }

  public start() {
    if (this.action === "passwordreset")
      this.handlePasswordReset()
    else if (this.action === "registration")
      this.handleUserRegistration()
    else
      throw new Error(`Unknown action: ${this.action}`)
  }

  private handlePasswordReset() {
    if (!this.contributorId)
        throw new Error("User ID not provided")
    let dialog = this.dash.create(PasswordResetDialog, this.contributorId, this.token)
    dialog.open()
  }

  private async handleUserRegistration() {
    let dialog = this.dash.create(RegistrationForm, this.token)
    let b = await dialog.open()
    if (b) {
      // Redirect user to login page.
      window.location.href = `${config.urlPrefix}/index.html`
    }
  }
}
