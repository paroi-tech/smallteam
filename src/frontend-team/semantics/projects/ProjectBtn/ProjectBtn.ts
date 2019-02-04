import { render } from "@tomko/lt-monkberry"
import { addCssClass, catchAndLog } from "../../../../sharedFrontend/libraries/utils"
import { OwnDash } from "../../../App/OwnDash"
import { ProjectModel, UpdateModelEvent } from "../../../AppModel/AppModel"

const template = require("./ProjectBtn.monk")

export interface ProjectBtnOptions {
  project: ProjectModel
  cssClass?: string | string[]
}

export default class ProjectBtn {
  readonly el: HTMLButtonElement

  private project: ProjectModel

  constructor(private dash: OwnDash, options: ProjectBtnOptions) {
    this.project = options.project

    let view = render(template)
    this.el = view.rootEl()
    addCssClass(this.el, options.cssClass)

    this.el.addEventListener("click", catchAndLog(() => { this.dash.app.navigate(`/prj-${this.project.id}`) }))

    view.update(this.project)
    dash.listenTo<UpdateModelEvent>(dash.app.model, "updateProject", evData => {
      if (evData.id === this.project.id)
        view.update(this.project)
    })
  }

  addCssClass(cssClass: string | string[]) {
    addCssClass(this.el, cssClass)
  }
}
