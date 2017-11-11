import { ApplicationDash, Log, LogItem } from "bkb"
import PasswordResetDialog from "../PasswordResetDialog/PasswordResetDialog"
import config from "../../isomorphic/config"

export default class App {
  readonly log: Log

  constructor(private dash: ApplicationDash<App>, private uid: string, private token: string) {
    this.log = dash.log
  }

  public start() {
    let dialog = this.dash.create(PasswordResetDialog, this.uid, this.token)
    dialog.open()
  }
}
