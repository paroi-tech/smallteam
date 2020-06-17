require("./_ProjectBtn.scss")
import handledom from "handledom"
import { addCssClass, catchAndLog } from "../../../../../shared-ui/libraries/utils"
import { OwnDash } from "../../../App/OwnDash"
import { ProjectModel, UpdateModelEvent } from "../../../AppModel/AppModel"

const template = handledom`
<button class="ProjectBtn" type="button">
  <i class="ProjectBtn-code">{{code}}</i>
  –
  <span class="ProjectBtn-name">{{name}}</span>
</button>
`

export interface ProjectBtnOptions {
  project: ProjectModel
  cssClass?: string | string[]
}

export default class ProjectBtn {
  readonly el: HTMLButtonElement

  private project: ProjectModel

  constructor(private dash: OwnDash, options: ProjectBtnOptions) {
    this.project = options.project

    const { root, update } = template()
    this.el = root as HTMLButtonElement
    addCssClass(this.el, options.cssClass)

    this.el.addEventListener("click", catchAndLog(() => { this.dash.app.navigate(`/prj-${this.project.id}`) }))

    update(this.project)
    dash.listenTo<UpdateModelEvent>(dash.app.model, "updateProject", evData => {
      if (evData.id === this.project.id)
        update(this.project)
    })
  }

  addCssClass(cssClass: string | string[]) {
    addCssClass(this.el, cssClass)
  }
}
