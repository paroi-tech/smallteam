import { AppDash, Log, LogEvent } from "bkb"
import TeamCreationDialog from "../../../shared-ui/components/TeamCreationDialog"
import ErrorDialog from "../../../shared-ui/modal-dialogs/ErrorDialog"
import InfoDialog from "../../../shared-ui/modal-dialogs/InfoDialog"

export interface AppOptions {
  action?: string
  token?: string
}

export default class App {
  readonly log: Log
  readonly baseUrl: string
  private teamDialog: TeamCreationDialog

  constructor(private dash: AppDash<App>, private options: AppOptions = {}) {
    this.log = dash.log
    this.baseUrl = document.documentElement!.dataset.baseUrl || ""
    this.teamDialog = this.dash.create(TeamCreationDialog)
    this.dash.listenTo<LogEvent>("log", data => {
      // tslint:disable-next-line:no-console
      console.log(`[${data.level}]`, ...data.messages)
    })
  }

  start() {
    if ((!this.options.action && !this.options.token) || (this.options.action === "register")) {
      this.showTeamCreationDialog()
      return
    }

    if (this.options.action === "activate") {
      this.activateTeam()
      return
    }

    throw new Error("Unknown action parameter")
  }

  private async activateTeam() {
    if (!this.options.token)
      throw new Error("Token not found")

    try {
      let response = await fetch(`${this.baseUrl}/api/team/activate`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ token: this.options.token })
      })

      if (!response.ok) {
        await this.dash.create(ErrorDialog).show("Cannot complete this task now. Try again in a moment.")
        return
      }

      let data = await response.json()

      if (!data.done) {
        this.dash.create(ErrorDialog).show("Team activation failed.")
        return
      }
      // FIXME: redirect to home if there is no base URL.
      document.location!.href = `${data.teamUrl}`
    } catch (error) {
      this.dash.create(InfoDialog).show("Something went wrong. We cannot reach our server.")
    }
  }

  private async showTeamCreationDialog() {
    await this.teamDialog.open()
  }
}
