import * as $ from "jquery"
import {Application, ApplicationDash, ApplicationBkb, Log, LogItem} from "bkb"
import StepsPanel from "../StepsPanel/StepsPanel"

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
    let panel = this.dash.create(StepsPanel, {args: ["1", "My StepsPanel"]})
    panel.init()
    panel.attachTo($app[0])
  }
}