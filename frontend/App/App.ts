import { ApplicationDash, ApplicationBkb, Log, LogItem, Component } from "bkb"
import WorkspaceViewer from "../WorkspaceViewer/WorkspaceViewer"
import ModelComp, { Model, ModelEvent } from "../AppModel/AppModel"

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

    this.model.on("change", "dataFirst", data => {
      if (data.orderedIds)
        console.log(`[MODEL] ${data.cmd} ${data.type}`, data.orderedIds)
      else
        console.log(`[MODEL] ${data.cmd} ${data.type} ${data.id}`, data.model)
    })
  }

  public async start() {
    await this.model.global.load
    let appEl = document.querySelector(".js-app")
    if (appEl) {
      let viewer = this.dash.create(WorkspaceViewer)
      appEl.appendChild(viewer.el)
    }
  }
}