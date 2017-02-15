import * as $ from "jquery"
import { ApplicationDash, ApplicationBkb, Log, LogItem, Component } from "bkb"
import PanelSelector from "../PanelSelector/PanelSelector"
import Model from "../Model/Model"

export default class App {
  readonly log: Log
  readonly nextTick: (cb: () => void) => void
  readonly model: Component<Model>

  constructor(private dash: ApplicationDash<App>) {
    this.log = dash.bkb.log
    this.nextTick = dash.bkb.nextTick
    this.model = dash.create(Model)

    this.dash.on("log", "dataFirst", (data: LogItem) => {
      console.log(`[LOG] ${data.type} `, data.messages)
    })
  }

  public start() {
    let $app = $(".js-app")
    let panel = this.dash.create(PanelSelector, { args: [] })
    panel.attachTo($app[0])
  }
}