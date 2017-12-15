import { Dash } from "bkb"
import { Workspace, ViewerController } from "../WorkspaceViewer/WorkspaceViewer"
import { render } from "monkberry"
import { Model } from "../../AppModel/modelDefinitions"

const template = require("./HomeWorkspace.monk")

export default class HomeWorkspace implements Workspace {
  readonly el: HTMLElement

  private model: Model

  private view: MonkberryView

  private ctrl: ViewerController | undefined

  constructor(private dash: Dash) {
    this.model = this.dash.app.model
    this.el = this.createView()
  }

  public activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    ctrl.setContentEl(this.el)
      .setTitle("Home")
  }

  public deactivate() {}

  private createView() {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement

    return el
  }
}
