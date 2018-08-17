import { AppDash, Log, LogEvent } from "bkb"
import TeamCreationDialog from "../../frontend/generics/TeamCreationDialog/TeamCreationDialog"

export default class App {
  readonly log: Log
  readonly baseUrl: string
  private teamDialog: TeamCreationDialog

  constructor(private dash: AppDash<App>, private action: string, private token?: string) {
    this.log = dash.log
    this.baseUrl = document.documentElement.dataset.baseUrl || ""
    this.teamDialog = this.dash.create(TeamCreationDialog)
    this.dash.listenTo<LogEvent>("log", data => {
      console.log(`[${data.level}]`, ...data.messages)
    })
  }

  public start() {

  }
}
