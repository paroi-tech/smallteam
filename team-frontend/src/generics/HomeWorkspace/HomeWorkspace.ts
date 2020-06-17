require("./_HomeWorkspace.scss")
import { Dash, Log } from "bkb"
import handledom from "handledom"
import { Model } from "../../AppModel/modelDefinitions"
import { ViewerController, Workspace } from "../WorkspaceViewer/WorkspaceViewer"

const template = handledom`
<div class="HomeWorkspace">
  <header class="HomeWorkspace-header">Welcome</header>
  <div class="HomeWorkspace-divLogo"></div>
</div>
`

export default class HomeWorkspace implements Workspace {
  readonly el: HTMLElement
  private ctrl: ViewerController | undefined
  private model: Model
  private log: Log


  constructor(private dash: Dash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    const { root } = template()
    this.el = root
  }

  activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    ctrl.setContentEl(this.el)
      .setTitle("Home")
  }
}
