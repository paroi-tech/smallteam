require("./_Workspace404.scss")
import { Dash } from "bkb"
import handledom from "handledom"
import { ViewerController, Workspace } from "../WorkspaceViewer/WorkspaceViewer"

const template = handledom`
<div class="Workspace404">
  <span class="Workspace404-span"><i class="fa fa-frown-o fa-5x"></i></span>
  <p class="Workspace404-p">404: Not Found</p>
</div>
`

export default class Workspace404 implements Workspace {
  readonly el: HTMLElement

  private ctrl: ViewerController | undefined

  constructor(private dash: Dash) {
    this.el = template().root
  }

  activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    ctrl.setContentEl(this.el).setTitle("Oups!!!")
  }
}
