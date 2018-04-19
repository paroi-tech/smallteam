import App from "../../../App/App"
import { Dash, Log } from "bkb"
import ContributorBox from "../ContributorBox/ContributorBox"
import ContributorForm from "../ContributorForm/ContributorForm"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import { createCustomMenuBtnEl } from "../../../generics/WorkspaceViewer/workspaceUtils"
import BoxList from "../../../generics/BoxList/BoxList"
import { DropdownMenu, DropdownMenuOptions } from "../../../generics/DropdownMenu/DropdownMenu"
import { Model, ContributorModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { ChildEasyRouter, createChildEasyRouter, ERQuery } from "../../../libraries/EasyRouter"
import { OwnDash } from "../../../App/OwnDash";
import { render } from "../../../libraries/lt-monkberry";

const template = require("./ContributorWorkspace.monk")

export default class ContributorWorkspace implements Workspace {
  readonly el: HTMLElement

  private boxList: BoxList<ContributorBox>
  private form: ContributorForm
  private menu: DropdownMenu

  private model: Model
  private log: Log

  private contributors: Map<string, ContributorModel> = new Map()
  private boxes: Map<string, ContributorBox> = new Map()

  readonly childRouter: ChildEasyRouter

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    let view = render(template)
    this.el = view.rootEl()

    this.form = this.dash.create(ContributorForm)
    view.ref("form").appendChild(this.form.el)
    this.boxList = this.dash.create(BoxList, {
      id: "contributorBoxList",
      name: "Contributors",
      sort: false
    })
    view.ref("list").appendChild(this.boxList.el)
    this.menu = this.dash.create(DropdownMenu, {
      btnEl: createCustomMenuBtnEl()
    })
    this.menu.entries.createNavBtn({
      label: "Add contributor",
      onClick: () => this.form.reset()
    })

    this.dash.listenToModel("createContributor", data => {
      let contributor = data.model as ContributorModel
      let box = this.createBoxFor(contributor)

      this.contributors.set(contributor.id, contributor)
      this.boxList.addBox(box)
    })
    this.dash.listenTo<ContributorModel>("contributorBoxSelected", data => {
      this.form.setContributor(data)
    })

    this.fillBoxList()

    this.childRouter = createChildEasyRouter()
    this.childRouter.addAsyncErrorListener(this.log.info)
    this.childRouter.map({
      route: "my-profile",
      activate: (query: ERQuery) => {
        this.form.setContributor(this.model.session.contributor)
      },
      title: "My Profile"
    })
  }

  public activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el)
      .setTitleRightEl(this.menu.btnEl)
      .setTitle("Contributors")
  }

  public deactivate() {
  }

  private fillBoxList() {
    this.model.global.contributors.forEach(c => {
      let box = this.createBoxFor(c)

      this.contributors.set(c.id, c)
      this.boxList.addBox(box)
    })
  }

  private createBoxFor(contributor: ContributorModel): ContributorBox {
    let box = this.dash.create(ContributorBox, contributor)
    this.boxes.set(contributor.id, box)

    return box
  }
}
