import { Dash, Bkb } from "bkb"
import App from "../App/App"
import BoxList, { Box, BoxListParams } from "../BoxList/BoxList"
import { MenuItem } from "../Menu/Menu"
import { DropdownMenu } from "../DropdownMenu/DropdownMenu"
import { Model, ContributorModel } from "../AppModel/AppModel"
import ContributorBox from "../ContributorBox/ContributorBox"
import ContributorForm from "../ContributorForm/ContributorForm"
import { Workspace, ViewerController } from "../WorkspaceViewer/WorkspaceViewer"
import { UpdateModelEvent } from "../AppModel/ModelEngine"
import { render } from "monkberry"

import * as template from "./ContributorWorkspace.monk"

export default class ContributorWorkspace implements Workspace {
  readonly el: HTMLElement

  private boxListContainerEl: HTMLElement
  private formContainerEl: HTMLElement

  private boxList: BoxList<ContributorBox>
  private form: ContributorForm
  private menu: DropdownMenu

  private model: Model

  private contributors: Map<string, ContributorModel> = new Map()
  private boxes: Map<string, ContributorBox> = new Map()

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createHtmlElements()
    this.createChildComponents()
    this.listenToModel()
    this.listenToChildren()
    this.fillBoxList()
  }

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

    this.menu = this.dash.create(DropdownMenu, "left")
    this.menu.addItem({
      id: "createContributor",
      label: "Add contributor"
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
      this.form.setContributor(data)
    })
    this.dash.listenTo(this.menu, "select").onData(itemId => {
      // FIXME: unselect current item in Contributor BoxList.
      if (itemId === "createContributor")
        this.form.switchToCreationMode()
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

  public activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el)
        .setSidebarEl(this.menu.el)
        .setTitle("Contributors")
  }

  public deactivate() {
  }
}
