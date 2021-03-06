import { removeAllChildren } from "@smallteam-local/shared-ui/libraries/utils"
import ErrorDialog from "@smallteam-local/shared-ui/modal-dialogs/ErrorDialog"
import InfoDialog from "@smallteam-local/shared-ui/modal-dialogs/InfoDialog"
import { AppDash, Log, LogEvent } from "bkb"
import TeamCreationPanel from "./TeamCreationPanel"

export interface AppOptions {
  action?: string
  token?: string
}

export default class App {
  readonly log: Log
  readonly baseUrl: string
  private teamPanel: TeamCreationPanel

  constructor(private dash: AppDash<App>, private options: AppOptions = {}) {
    this.log = dash.log
    this.baseUrl = document.documentElement!.dataset.baseUrl || ""
    this.teamPanel = this.dash.create(TeamCreationPanel)

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
    const appEl = document.querySelector(".js-app")

    if (!appEl)
      throw new Error("Missing '.js-app' element.")

    removeAllChildren(appEl)
    if ((!this.options.action && !this.options.token) || (this.options.action === "register")) {
      this.teamPanel = this.dash.create(TeamCreationPanel)
      appEl.appendChild(this.teamPanel.el)
      return
    }

    if (this.options.action === "activate") {
      void this.activateTeam()
      return
    }

    throw new Error("Unknown action parameter")
  }

  private async activateTeam() {
    if (!this.options.token)
      throw new Error("Token not found")

    try {
      const response = await fetch(`${this.baseUrl}/api/team/activate`, {
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

      const data = await response.json()

      if (!data.done) {
        void this.dash.create(ErrorDialog).show("Team activation failed.")
        return
      }
      // FIXME: redirect to home if there is no base URL.
      document.location!.href = `${data.teamUrl}`
    } catch (error) {
      void this.dash.create(InfoDialog).show("Something went wrong. We cannot reach our server.")
    }
  }
}
