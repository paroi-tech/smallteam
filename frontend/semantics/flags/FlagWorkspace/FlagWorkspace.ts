import { Dash, Log } from "bkb"
import { render } from "monkberry"
import FlagForm from "../FlagForm/FlagForm"
import FlagBox from "../FlagBox/FlagBox"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import BoxList, { BoxListEvent } from "../../../generics/BoxList/BoxList"
import { DropdownMenu, DropdownMenuOptions } from "../../../generics/DropdownMenu/DropdownMenu"
import { Model, FlagModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { equal } from "../../../libraries/utils"
import { createCustomMenuBtnEl } from "../../../generics/WorkspaceViewer/workspaceUtils"
import { OwnDash } from "../../../App/OwnDash";

const template = require("./FlagWorkspace.monk")

export default class FlagWorkspace implements Workspace {
  readonly el: HTMLElement
  private boxListContainerEl: HTMLElement
  private formContainerEl: HTMLElement

  private boxList: BoxList<FlagBox>
  private form: FlagForm
  private menu: DropdownMenu

  private model: Model
  private log: Log

  private view: MonkberryView

  /**
   * Timer used to schedule the commit of the changes in the BoxList to the model.
   */
  private timer: any

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.boxListContainerEl = this.el.querySelector(".js-boxlist-container") as HTMLElement
    this.formContainerEl = this.el.querySelector(".js-form-container") as HTMLElement

    this.boxList = this.dash.create(BoxList, {
      id: "",
      name: "Flags",
      group: undefined,
      sort: true
    })
    this.boxListContainerEl.appendChild(this.boxList.el)
    this.form = this.dash.create(FlagForm)
    this.formContainerEl.appendChild(this.form.el)
    this.menu = this.dash.create(DropdownMenu, {
        btnEl: createCustomMenuBtnEl(),
        align: "left"
      } as DropdownMenuOptions
    )
    this.menu.entries.createNavBtn({
      label: "Add new flag",
      onClick: () => this.form.switchToCreationMode()
    })

    this.fillBoxList()

    this.dash.listenTo<FlagModel>("flagBoxSelected", flag => this.form.flag = flag)
    this.dash.listenTo<BoxListEvent>("boxListSortingUpdated", data => this.scheduleFlagReordering(data))

    this.dash.listenToModel("createFlag", data => {
      let flag = data.model as FlagModel
      let box = this.dash.create(FlagBox, flag)
      this.boxList.addBox(box)
    })
    this.dash.listenToModel("deleteFlag", d => this.boxList.removeBox(d.id as string))
  }

  private scheduleFlagReordering(ev: BoxListEvent) {
    if (this.timer)
      clearTimeout(this.timer)
    this.timer = setTimeout(() =>  this.doUpdate(ev.boxIds), 2000)
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

  public activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el)
        .setTitleRightEl(this.menu.btnEl)
        .setTitle("Flags")
  }

  public deactivate() {
  }
}
