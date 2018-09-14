import { render } from "@fabtom/lt-monkberry"
import { OwnDash } from "../../App/OwnDash"
import { ProjectModel } from "../../AppModel/AppModel"
import NavBtn from "../../generics/NavBtn/NavBtn"
import NavMenu from "../../generics/NavMenu/NavMenu"
import ProjectBtn from "../../semantics/projects/ProjectBtn/ProjectBtn"
import { ERQuery } from "../../libraries/EasyRouter";

const template = require("./Sidebar.monk")

export default class Sidebar {
  readonly el: Element

  private menu: NavMenu
  private buttons = new Map<string, ProjectBtn>()

  constructor(private dash: OwnDash) {
    let view = render(template)
    this.el = view.rootEl()

    this.menu = dash.create(NavMenu, { direction: "column" })
    view.ref("top").appendChild(this.menu.el)

    view.ref("bottom").appendChild(dash.create(NavBtn, {
      label: "New project",
      onClick: () => dash.app.navigate("/new-project"),
      cssClass: ["-newProject", "ProjectBtn"]
    }).el)

    dash.listenTo(dash.app, "navigate", (query: ERQuery) => {
      let qs = query.processedQueryString || ""
      let lastCharIndex = qs.length - 1
      if (lastCharIndex < 0)
        return
      if (qs.charAt(lastCharIndex) === "/")
        qs = qs.slice(0, -1)
      if (!qs)
        return
      Array.from(this.buttons.values()).forEach(btn => btn.el.classList.remove("-current"))
      let btn = this.buttons.get(qs)
      if (btn)
        btn.el.classList.add("-current")
    })
  }

  addProject(project: ProjectModel, path: string) {
    let btn = this.dash.create(ProjectBtn, { project })
    this.buttons.set(path, btn)
    this.menu.addItem(btn)
  }
}
