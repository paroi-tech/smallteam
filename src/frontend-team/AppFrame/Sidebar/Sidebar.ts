import { render } from "@fabtom/lt-monkberry"
import { OwnDash } from "../../App/OwnDash"
import { ProjectModel } from "../../AppModel/AppModel"
import NavBtn from "../../generics/NavBtn/NavBtn"
import NavMenu from "../../generics/NavMenu/NavMenu"
import ProjectBtn from "../../semantics/projects/ProjectBtn/ProjectBtn"

const template = require("./Sidebar.monk")

export default class Sidebar {
  readonly el: Element

  private menu: NavMenu

  constructor(private dash: OwnDash) {
    let view = render(template)
    this.el = view.rootEl()

    this.menu = dash.create(NavMenu, { direction: "column" })
    view.ref("top").appendChild(this.menu.el)

    view.ref("bottom").appendChild(dash.create(NavBtn, {
      label: "New project",
      onClick: () => this.dash.app.navigate("/new-project"),
      cssClass: ["-newProject", "ProjectBtn"]
    }).el)
  }

  addProject(project: ProjectModel, path: string) {
    let btn = this.dash.create(ProjectBtn, { project })
    this.menu.addItem(btn)
  }
}
