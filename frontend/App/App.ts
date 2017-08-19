import * as $ from "jquery"
import { ApplicationDash, ApplicationBkb, Log, LogItem, Component } from "bkb"
import PanelSelector from "../PanelSelector/PanelSelector"
import ModelComp, { Model } from "../Model/Model"
import { ModelEvent } from "../Model/ModelEngine";

export default class App {
  readonly log: Log
  readonly nextTick: (cb: () => void) => void
  readonly model: Component<Model>

  constructor(private dash: ApplicationDash<App>) {
    this.log = dash.bkb.log
    this.nextTick = dash.bkb.nextTick
    this.model = dash.create(ModelComp)

    this.dash.on("log", "dataFirst", (data: LogItem) => {
      console.log(`[LOG] ${data.type} `, data.messages)
    })

    this.model.on("change", "dataFirst", data => console.log(`[MODEL] ${data.cmd} ${data.type} ${data.id}`, data.model))
  }

  public start() {
    let $app = $(".js-app")
    let panel = this.dash.create(PanelSelector, { args: [] })
    panel.attachTo($app[0])
  }
}