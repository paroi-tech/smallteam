import { Dash } from "bkb"
import { render } from "monkberry"
import { ProjectModel } from "../../AppModel/AppModel";
import NavMenu, { NavMenuOptions } from "../../generics/NavMenu/NavMenu";
import App from "../../App/App";
import NavBtn, { NavBtnOptions } from "../../generics/NavBtn/NavBtn";

const template = require("./Sidebar.monk")

export default class Sidebar {
  readonly el: HTMLElement

  private menu: NavMenu

  constructor(private dash: Dash<App>) {
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

  public addProject(p: ProjectModel, path: string) {
    this.menu.createNavBtn({
      label: p.code,
      onClick: () => this.dash.app.navigate(path)
    })
  }
}
