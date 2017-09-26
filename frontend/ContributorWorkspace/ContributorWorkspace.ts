import * as $ from "jquery"
import { Dash, Bkb, Component } from "bkb"
import App from "../App/App"
import BoxList, { Box, BoxListParams } from "../BoxList/BoxList"
import { MenuItem } from "../Menu/Menu"
import { DropdownMenu } from "../DropdownMenu/DropdownMenu"
import { Model, ContributorModel } from "../AppModel/AppModel"
import ContributorBox from "../ContributorBox/ContributorBox"
import ContributorForm from "../ContributorForm/ContributorForm"
import { Workspace, ViewerController } from "../WorkspaceViewer/WorkspaceViewer"

const template = require("html-loader!./contributorworkspace.html")

export default class ContributorWorkspace implements Workspace {
  readonly el: HTMLElement

  private boxListContainerEl: HTMLElement
  private formContainerEl: HTMLElement
  private menuContainerEl: HTMLElement

  private boxList: BoxList<ContributorBox>
  private form: ContributorForm
  private menu: Component<DropdownMenu>

  private model: Model

  private contributorMap: Map<string, ContributorModel> = new Map()
  private boxMap: Map<string, ContributorBox> = new Map()

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createHtmlElements()
    this.createChildComponents()
    this.listenToModel()
    this.listenToChildren()
    this.fillBoxList()
  }

  private createHtmlElements(): HTMLElement {
    let $container = $(template)
    this.boxListContainerEl = $container.find(".js-boxlist-container").get(0)
    this.formContainerEl = $container.find(".js-form-container").get(0)
    this.menuContainerEl = $container.find(".js-menu-container").get(0)
    return $container.get(0)
  }

  private createChildComponents() {
    this.form = this.dash.create(ContributorForm, { args: [] })
    this.formContainerEl.appendChild(this.form.el)

    let params = {
      id: "contributorBoxList",
      name: "Contributors",
      sort: false
    }
    this.boxList = this.dash.create(BoxList, { args: [ params ] })
    this.boxListContainerEl.appendChild(this.boxList.el)

    this.menu = this.dash.create(DropdownMenu, {
      args: ["left"]
    })
    this.menu.addItem({
      id: "createContributor",
      label: "Add contributor"
    })
    this.menuContainerEl.appendChild(this.menu.el)
  }

  private listenToModel() {
    this.model.on("change", "dataFirst", data => {
      if (data.cmd !== "create" || data.type !== "Contributor")
        return
      let contributor = data.model as ContributorModel
      let box = this.createBoxFor(contributor)
      this.contributorMap.set(contributor.id, contributor)
      this.boxList.addBox(box)
    })
  }

  private listenToChildren() {
    this.dash.listenToChildren<ContributorModel>("contributorBoxSelected").call("dataFirst", data => {
      this.form.setContributor(data)
    })
    this.menu.bkb.on("select", "dataFirst", itemId => {
      // FIXME: unselect current item in Contributor BoxList.
      if (itemId === "createContributor")
        this.form.switchToCreationMode()
    })
  }

  private fillBoxList() {
    this.model.global.contributors.forEach(c => {
      let box = this.createBoxFor(c)
      this.contributorMap.set(c.id, c)
      this.boxList.addBox(box)
    })
  }

  private createBoxFor(contributor: ContributorModel): ContributorBox {
    let box = this.dash.create(ContributorBox, { args: [ contributor ] })
    this.boxMap.set(contributor.id, box)
    return box
  }

  public activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el)
  }

  public deactivate() {
  }
}
