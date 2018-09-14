import { Log } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import FlagForm from "../FlagForm/FlagForm"
import FlagBox from "../FlagBox/FlagBox"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import BoxList, { BoxListEvent } from "../../../generics/BoxList/BoxList"
import { DropdownMenu, DropdownMenuOptions } from "../../../generics/DropdownMenu/DropdownMenu"
import { Model, FlagModel } from "../../../AppModel/AppModel"
import { createCustomMenuBtnEl } from "../../../generics/WorkspaceViewer/workspaceUtils"
import { OwnDash } from "../../../App/OwnDash"
import { equal } from "../../../../sharedFrontend/libraries/utils"

const template = require("./FlagWorkspace.monk")

export default class FlagWorkspace implements Workspace {
  readonly el: HTMLElement

  private boxList: BoxList<FlagBox>
  private form: FlagForm
  private menu: DropdownMenu

  private model: Model
  private log: Log

  /**
   * Timer used to schedule the commit of the changes in the BoxList to the model.
   */
  private timer: any

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    let view = render(template)
    this.el = view.rootEl()

    this.boxList = this.dash.create(BoxList, {
      title: "Flags",
      sort: true
    })
    view.ref("list").appendChild(this.boxList.el)

    this.form = this.dash.create(FlagForm)
    view.ref("form").appendChild(this.form.el)

    this.menu = this.dash.create(DropdownMenu, {
      btnEl: createCustomMenuBtnEl(),
      align: "left"
    })
    this.menu.entries.createNavBtn({
      label: "Add new flag",
      onClick: () => this.form.switchToCreationMode()
    })

    this.fillBoxList()

    this.dash.listenTo<FlagModel>("flagBoxSelected", flag => this.form.setFlag(flag))
    this.dash.listenTo<BoxListEvent>("boxListSortingUpdated", data => this.scheduleFlagReordering(data))
    this.dash.listenToModel("deleteFlag", data => this.boxList.removeBox(data.id as string))
    this.dash.listenToModel("createFlag", data => {
      let flag = data.model as FlagModel
      let box = this.dash.create(FlagBox, flag)
      this.boxList.addBox(box)
    })
  }

  activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el)
      .setTitleRightEl(this.menu.btnEl)
      .setTitle("Flags")
  }

  deactivate() {
  }

  private scheduleFlagReordering(ev: BoxListEvent) {
    if (this.timer)
      clearTimeout(this.timer)
    this.timer = setTimeout(() => this.doUpdate(ev.boxIds), 2000)
  }

  private async doUpdate(ids: string[]): Promise<void> {
    let currentOrder = this.boxList.getOrder()
    this.boxList.disable(true)

    try {
      let idList = await this.dash.app.model.reorder("Flag", ids)
      if (!equal(idList, ids)) {
        this.log.error("Sorry. Server rejected new order of flags...", idList, ids)
        this.boxList.sort(idList)
      }
    } catch (err) {
      this.log.info("Sorry. Unable to save the new order of flags on server.", err)
      this.boxList.sort(currentOrder)
    }

    this.boxList.enable(true)
    this.form.reset()
  }

  private async fillBoxList() {
    this.model.global.flags.forEach(flag => this.boxList.addBox(this.dash.create(FlagBox, flag)))
  }
}
