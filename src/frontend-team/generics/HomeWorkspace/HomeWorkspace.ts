import { LtMonkberryView, render } from "@fabtom/lt-monkberry"
import { Dash, Log } from "bkb"
import { Model } from "../../AppModel/modelDefinitions"
import { ViewerController, Workspace } from "../WorkspaceViewer/WorkspaceViewer"

const template = require("./HomeWorkspace.monk")

export default class HomeWorkspace implements Workspace {
  readonly el: HTMLElement
  private ctrl: ViewerController | undefined
  private model: Model
  private log: Log


  constructor(private dash: Dash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    let view = render(template)
    this.el = view.rootEl()
  }

  activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    ctrl.setContentEl(this.el)
      .setTitle("Home")
  }

  deactivate() {
  }
}
