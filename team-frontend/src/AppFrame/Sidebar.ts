import handledom from "handledom"
import { ProjectModel } from "../AppModel/AppModel"
import NavBtn from "../generics/NavBtn"
import NavMenu from "../generics/NavMenu"
import { ERQuery } from "../libraries/EasyRouter"
import ProjectBtn from "../semantics/projects/ProjectBtn"
import { OwnDash } from "./OwnDash"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
@import "../shared-ui/theme/definitions";

.Sidebar {
  color: #fff;
  background-color: #051837;
  height: 100%;

  &-h1 {
    // color: #bbb;
    font-size: $f14;
    height: 41px;
    line-height: 41px;
    margin: 0 0 5px 4px;
    padding: 2px 0 0 38px;
    position: relative;
    &::before {
      // background: url(sprite.png) no-repeat -115px 2px;
      @include bgSprite(-115px, 2px);
      content: "";
      height: 18px;
      left: 7px;
      position: absolute;
      top: 13px;
      width: 26px;
    }
  }

  &-bottom {
    height: 35px;
  }
}
`

const template = handledom`
<section class="Sidebar FlexBar -column">
  <div class="-grow">
    <h1 class="Sidebar-h1">Dashboard</h1>
    <div h="top"></div>
  </div>
  <div class="Sidebar-bottom" h="bottom"></div>
</section>
`

export default class Sidebar {
  readonly el: Element

  private menu: NavMenu
  private buttons = new Map<string, ProjectBtn>()

  constructor(private dash: OwnDash) {
    const { root, ref } = template()
    this.el = root

    this.menu = dash.create(NavMenu, { direction: "column" })
    ref("top").appendChild(this.menu.el)

    ref("bottom").appendChild(dash.create(NavBtn, {
      label: "New project",
      onClick: () => dash.app.navigate("/new-project"),
      cssClass: ["-newProject", "ProjectBtn"]
    }).el)

    dash.listenTo(dash.app, "navigate", (query: ERQuery) => {
      let qs = query.processedQueryString || ""
      const lastCharIndex = qs.length - 1
      if (lastCharIndex < 0)
        return
      if (qs.charAt(lastCharIndex) === "/")
        qs = qs.slice(0, -1)
      if (!qs)
        return
      Array.from(this.buttons.values()).forEach(btn => btn.el.classList.remove("-current"))
      const btn = this.buttons.get(qs)
      if (btn)
        btn.el.classList.add("-current")
    })
  }

  addProject(project: ProjectModel, path: string) {
    const btn = this.dash.create(ProjectBtn, { project })
    this.buttons.set(path, btn)
    this.menu.addItem(btn)
  }
}
