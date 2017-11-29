import { Dash } from "bkb"
import App from "../../../App/App"
import { render } from "monkberry"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import { Model, UpdateModelEvent } from "../../../AppModel/AppModel"

const template = require("./SearchWorkspace.monk")

export default class SearchWorkspace implements Workspace {
  readonly el: HTMLElement

  private view: MonkberryView

  private model: Model

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createView()
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"))
    let el = this.view.nodes[0] as HTMLElement

    return el
  }

  public activate(ctrl: ViewerController, data?: any) {
    ctrl.setContentEl(this.el)
      .setTitle("Search results")
    if (data && data.query)
      console.log(`Search workspace activated with query: ${data.query}`)
  }

  public deactivate() {}
}
