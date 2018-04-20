import { Dash } from "bkb"
import { ProjectModel } from "../../AppModel/AppModel"
import NavMenu, { NavMenuOptions } from "../../generics/NavMenu/NavMenu"
import { OwnDash } from "../../App/OwnDash"
import App from "../../App/App"
import NavBtn, { NavBtnOptions } from "../../generics/NavBtn/NavBtn"
import ProjectBtn, { ProjectBtnOptions } from "../../semantics/projects/ProjectBtn/ProjectBtn"
import { render } from "@fabtom/lt-monkberry";

const template = require("./Sidebar.monk")

export default class Sidebar {
  readonly el: Element

  private menu: NavMenu

  constructor(private dash: OwnDash) {
    let view = render(template)
    this.el = view.rootEl()

    this.menu = dash.create(NavMenu, { direction: "column" } as NavMenuOptions)
    view.ref("top").appendChild(this.menu.el)

    view.ref("bottom").appendChild(dash.create(NavBtn, {
      label: "New project",
      onClick: () => this.dash.app.navigate("/new-project"),
      cssClass: ["newProject", "ProjectBtn"]
    } as NavBtnOptions).el)
  }

  public addProject(project: ProjectModel, path: string) {
    this.menu.addItem(
      this.dash.create(ProjectBtn, { project } as ProjectBtnOptions)
    )
  }
}
