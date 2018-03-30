import { Dash } from "bkb"
import { render } from "monkberry"
import { ProjectModel } from "../../AppModel/AppModel"
import NavMenu, { NavMenuOptions } from "../../generics/NavMenu/NavMenu"
import { OwnDash } from "../../App/OwnDash"
import App from "../../App/App"
import NavBtn, { NavBtnOptions } from "../../generics/NavBtn/NavBtn"
import ProjectBtn, { ProjectBtnOptions } from "../../semantics/projects/ProjectBtn/ProjectBtn"

const template = require("./Sidebar.monk")

export default class Sidebar {
  readonly el: HTMLElement

  private menu: NavMenu

  constructor(private dash: OwnDash) {
    let view = render(template, document.createElement("div"))
    this.el = view.nodes[0] as HTMLElement

    let topEl = this.el.querySelector(".js-top") as HTMLElement
    this.menu = dash.create(NavMenu, { direction: "column" } as NavMenuOptions)
    topEl.appendChild(this.menu.el)

    let bottomEl = this.el.querySelector(".js-bottom") as HTMLElement
    let addBtn = dash.create(NavBtn, {
      label: "New project",
      onClick: () => this.dash.app.navigate("/new-project")
    } as NavBtnOptions)
    bottomEl.appendChild(addBtn.el)
  }

  public addProject(project: ProjectModel, path: string) {
    this.menu.addItem(
      this.dash.create(ProjectBtn, { project } as ProjectBtnOptions)
    )
  }
}
