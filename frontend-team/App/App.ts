import { AppDash, Log, LogEvent } from "bkb"
import TeamCreationDialog from "../../frontend/generics/TeamCreationDialog/TeamCreationDialog"
import config from "../../isomorphic/config"

export default class App {
  readonly log: Log
  private teamDialog: TeamCreationDialog

  constructor(private dash: AppDash<App>) {
    this.log = dash.log
    this.teamDialog = this.dash.create(TeamCreationDialog)
    this.dash.listenTo<LogEvent>("log", data => {
      console.log(`[${data.level}]`, ...data.messages)
    })
  }

  public start() {

  }
}
