import { Dash } from "bkb"
import { Workspace, ViewerController } from "../WorkspaceViewer/WorkspaceViewer";
import { render } from "monkberry"

const template = require("./Workspace404.monk")

export default class Workspace404 implements Workspace {
  readonly el: HTMLElement

  private ctrl: ViewerController | undefined

  constructor(private dash: Dash) {
    let view = render(template, document.createElement("div"))
    this.el = view.nodes[0] as HTMLElement
  }

  public activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    ctrl.setContentEl(this.el)
        .setTitle("Oups!!!")
  }

  public deactivate() {
  }
}
