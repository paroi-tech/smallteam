import { AppDash, Log, LogEvent } from "bkb"
import PasswordResetDialog from "../PasswordResetDialog/PasswordResetDialog"
import config from "../../isomorphic/config"

export default class App {
  readonly log: Log

  constructor(private dash: AppDash<App>, private uid: string, private token: string) {
    this.log = dash.log
    this.dash.listenTo<LogEvent>("log", data => {
      console.log(`[${data.level}]`, ...data.messages)
    })
  }

  public start() {
    let dialog = this.dash.create(PasswordResetDialog, this.uid, this.token)
    dialog.open()
  }
}
