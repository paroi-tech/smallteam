import { Dash } from "bkb"
import { Workspace, ViewerController } from "../WorkspaceViewer/WorkspaceViewer"
import { render } from "monkberry"
import { Model } from "../../AppModel/modelDefinitions"

const template = require("./HomeWorkspace.monk")

export default class HomeWorkspace implements Workspace {
  readonly el: HTMLElement
  private inputEl: HTMLInputElement

  private model: Model

  private view: MonkberryView

  private ctrl: ViewerController | undefined

  constructor(private dash: Dash) {
    this.model = this.dash.app.model
    this.el = this.createView()
  }

  private createView() {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement

    this.inputEl = el.querySelector(".js-input") as HTMLInputElement
    this.inputEl.addEventListener("keypress", ev => {
      if (ev.key === "Enter")
        this.onSearch()
    })

    return el
  }

  private async onSearch() {
    let search = this.inputEl.value.trim()

    if (search.length === 0)
      return

    let result = await this.model.fetch("Task", {
      search
    })
    console.log("search results:", result)
  }

  public activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    ctrl.setContentEl(this.el)
      .setTitle("Home")
  }

  public deactivate() {}
}
