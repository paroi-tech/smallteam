import { render } from "@tomko/lt-monkberry"
import { Dash } from "bkb"
import { ViewerController, Workspace } from "../WorkspaceViewer/WorkspaceViewer"

const template = require("./Workspace404.monk")

export default class Workspace404 implements Workspace {
  readonly el: HTMLElement

  private ctrl: ViewerController | undefined

  constructor(private dash: Dash) {
    this.el = render(template).rootEl()
  }

  activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    ctrl.setContentEl(this.el).setTitle("Oups!!!")
  }
}
