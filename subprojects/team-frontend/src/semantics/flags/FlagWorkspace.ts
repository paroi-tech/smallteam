import { equal } from "@local-packages/shared-ui/libraries/utils"
import { Log } from "bkb"
import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { FlagModel, Model } from "../../AppModel/AppModel"
import BoxList, { BoxListEvent } from "../../generics/BoxList"
import { DropdownMenu } from "../../generics/DropdownMenu"
import { createCustomMenuBtnEl } from "../../generics/workspaceUtils"
import { ViewerController, Workspace } from "../../generics/WorkspaceViewer"
import FlagBox from "./FlagBox"
import FlagForm from "./FlagForm"

const template = handledom`
<div class="FlagWorkspace">
  <div h="list"></div>
  <div h="form"></div>
</div>
`

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

    const { root, ref } = template()
    this.el = root

    this.boxList = this.dash.create(BoxList, {
      title: "Flags",
      sort: true
    })
    ref("list").appendChild(this.boxList.el)

    this.form = this.dash.create(FlagForm)
    ref("form").appendChild(this.form.el)

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
      const flag = data.model as FlagModel
      const box = this.dash.create(FlagBox, flag)
      this.boxList.addBox(box)
    })
  }

  activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el)
      .setTitleRightEl(this.menu.btnEl)
      .setTitle("Flags")
  }

  private scheduleFlagReordering(ev: BoxListEvent) {
    if (this.timer)
      clearTimeout(this.timer)
    this.timer = setTimeout(() => this.doUpdate(ev.boxIds), 2000)
  }

  private async doUpdate(ids: string[]): Promise<void> {
    const currentOrder = this.boxList.getOrder()
    this.boxList.disable(true)

    try {
      const idList = await this.dash.app.model.reorder("Flag", ids)
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

  private fillBoxList() {
    this.model.global.flags.forEach(flag => this.boxList.addBox(this.dash.create(FlagBox, flag)))
  }
}
