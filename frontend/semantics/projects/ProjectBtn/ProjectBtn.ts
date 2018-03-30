import { Dash } from "bkb"
import { render } from "monkberry"
import { addCssClass, catchAndLog } from "../../../libraries/utils"
import { ProjectModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { OwnDash } from "../../../App/OwnDash";

const template = require("./ProjectBtn.monk")

export interface ProjectBtnOptions {
  project: ProjectModel
  cssClass?: string | string[]
}

export default class ProjectBtn {
  readonly el: HTMLButtonElement

  private project: ProjectModel

  private view: MonkberryView
  private state = {
    code: "",
    name: ""
  }

  constructor(private dash: OwnDash, options: ProjectBtnOptions) {
    this.project = options.project
    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLButtonElement
    addCssClass(this.el, options.cssClass)

    this.el.addEventListener("click", catchAndLog(() => { this.dash.app.navigate(`/prj-${this.project.id}`) }))

    this.view.update(this.project)
    dash.listenTo<UpdateModelEvent>(dash.app.model, "updateProject", evData => {
      if (evData.id === this.project.id)
        this.view.update(this.project)
    })
  }

  public addCssClass(cssClass: string | string[]) {
    addCssClass(this.el, cssClass)
  }
}
