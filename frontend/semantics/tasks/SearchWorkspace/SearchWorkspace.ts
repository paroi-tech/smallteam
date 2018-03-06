import { Dash } from "bkb"
import App from "../../../App/App"
import { render } from "monkberry"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import { Model, UpdateModelEvent } from "../../../AppModel/AppModel"

const template = require("./SearchWorkspace.monk")

export default class SearchWorkspace implements Workspace {
  readonly el: HTMLElement
  private inputEl: HTMLInputElement
  private view: MonkberryView

  private model: Model

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createView()
  }

  public activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el).setTitle("Search tasks")
  }

  public deactivate() {
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement
    this.inputEl = el.querySelector(".js-input") as HTMLInputElement
    this.inputEl.addEventListener("keypress", ev => this.onSearch(ev))

    return el
  }

  private async onSearch(ev: KeyboardEvent) {
    if (ev.key !== "Enter")
      return
    let query = this.inputEl.value.trim()
    if (query.length !== 0) {
      let r = await this.model.fetch("Task", { search: query })
      console.log(`fetch ${query} =>`, r.length)
    }
  }
}
