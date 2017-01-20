import * as $ from "jquery"
import { Application, ApplicationDash, ApplicationBkb, Log, LogItem } from "bkb"
import PanelSelector from "../PanelSelector/PanelSelector"

export default class App implements Application {
  readonly bkb: ApplicationBkb
  readonly log: Log
  readonly nextTick: (cb: () => void) => void

  constructor(private dash: ApplicationDash<App>) {
    this.log = dash.bkb.log
    this.nextTick = dash.bkb.nextTick

    this.dash.on("log", "dataFirst", (data: LogItem) => {
      console.log(`[LOG] ${data.type} `, data.messages)
    })
  }

  public start() {
    let $app = $(".js-app")
    let panel = this.dash.create(PanelSelector, { args: [] })
    panel.init()
    panel.attachTo($app[0])
  }
}