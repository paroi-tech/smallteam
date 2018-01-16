import App from "../../../App/App"
import { Dash, Log } from "bkb"
import ContributorBox from "../ContributorBox/ContributorBox"
import ContributorForm from "../ContributorForm/ContributorForm"
import { render } from "monkberry"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import { createCustomMenuBtnEl } from "../../../generics/WorkspaceViewer/workspaceUtils"
import BoxList from "../../../generics/BoxList/BoxList"
import { DropdownMenu, DropdownMenuOptions } from "../../../generics/DropdownMenu/DropdownMenu"
import { Model, ContributorModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { ChildEasyRouter, createChildEasyRouter, ERQuery } from "../../../libraries/EasyRouter"

const template = require("./ContributorWorkspace.monk")

export default class ContributorWorkspace implements Workspace {
  readonly el: HTMLElement
  private boxListContainerEl: HTMLElement
  private formContainerEl: HTMLElement

  private boxList: BoxList<ContributorBox>
  private form: ContributorForm
  private menu: DropdownMenu

  private model: Model
  private log: Log

  private contributors: Map<string, ContributorModel> = new Map()
  private boxes: Map<string, ContributorBox> = new Map()

  readonly childRouter: ChildEasyRouter

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log
    this.el = this.createHtmlElements()
    this.createChildComponents()
    this.listenToModel()
    this.listenToChildren()
    this.fillBoxList()

    this.childRouter = createChildEasyRouter()
    this.childRouter.addAsyncErrorListener(this.log.info)
    this.childRouter.map({
      route: "my-profile",
      activate: (query: ERQuery) => {
        this.form.contributor = this.model.session.contributor
      },
      title: "My Profile"
    })
  }

  public activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el)
      .setTitleRightEl(this.menu.btnEl)
      .setTitle("Contributors")
  }

  public deactivate() {}

  private createHtmlElements(): HTMLElement {
    let view = render(template, document.createElement("div"))
    let el = view.nodes[0] as HTMLElement

    this.boxListContainerEl = el.querySelector(".js-list") as HTMLElement
    this.formContainerEl = el.querySelector(".js-form") as HTMLElement

    return el
  }

  private createChildComponents() {
    this.form = this.dash.create(ContributorForm)
    this.formContainerEl.appendChild(this.form.el)

    let params = {
      id: "contributorBoxList",
      name: "Contributors",
      sort: false
    }
    this.boxList = this.dash.create(BoxList, params)
    this.boxListContainerEl.appendChild(this.boxList.el)

    this.menu = this.dash.create(DropdownMenu, {
      btnEl: createCustomMenuBtnEl()
    } as DropdownMenuOptions)
    this.menu.entries.createNavBtn({
      label: "Add contributor",
      onClick: () => this.form.reset()
    })
  }

  private listenToModel() {
    this.dash.listenTo<UpdateModelEvent>(this.model, "createContributor").onData(data => {
      let contributor = data.model as ContributorModel
      let box = this.createBoxFor(contributor)

      this.contributors.set(contributor.id, contributor)
      this.boxList.addBox(box)
    })
  }

  private listenToChildren() {
    this.dash.listenToChildren<ContributorModel>("contributorBoxSelected").onData(data => {
      this.form.contributor = data
    })
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
