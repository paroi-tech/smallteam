import { Dash, Log } from "bkb"
import handledom from "handledom"
import { Model } from "../AppModel/modelDefinitions"
import { ViewerController, Workspace } from "./WorkspaceViewer"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
@import "../shared-ui/theme/definitions";

.HomeWorkspace {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 300px;
  position: relative;

  &-header {
    font-size: $f38;
  }

  &-divLogo {
    background: url("/logo-2x.png") no-repeat center center;
    background-size: contain;
    height: 91px;
    width: 342px;
  }
}
`

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
