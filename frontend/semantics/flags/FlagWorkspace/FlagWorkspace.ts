import { Dash } from "bkb"
import { render } from "monkberry"
import FlagForm from "../FlagForm/FlagForm"
import FlagBox from "../FlagBox/FlagBox"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer";
import BoxList, { BoxListEvent } from "../../../generics/BoxList/BoxList";
import { DropdownMenu, DropdownMenuOptions } from "../../../generics/DropdownMenu/DropdownMenu";
import { Model, FlagModel, UpdateModelEvent } from "../../../AppModel/AppModel";
import App from "../../../App/App";
import { equal } from "../../../libraries/utils";
import { createCustomMenuBtnEl } from "../../../generics/WorkspaceViewer/workspaceUtils";

const template = require("./FlagWorkspace.monk")

export default class FlagWorkspace implements Workspace {
  readonly el: HTMLElement

  private boxListContainerEl: HTMLElement
  private formContainerEl: HTMLElement

  private boxList: BoxList<FlagBox>
  private form: FlagForm
  private menu: DropdownMenu

  private model: Model

  private view: MonkberryView

  /**
   * Timer used to schedule the commit of the changes in the BoxList to the model.
   */
  private timer: any

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.timer = undefined
    this.el = this.createView()
    this.createChildComponents()
    this.fillBoxList()
    this.listenToChildComponents()
    this.listenToModel()
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement

    this.boxListContainerEl = el.querySelector(".js-boxlist-container") as HTMLElement
    this.formContainerEl = el.querySelector(".js-form-container") as HTMLElement

    return el
  }

  private listenToChildComponents() {
    this.dash.listenToChildren<FlagModel>("flagBoxSelected").onData(flag => {
      this.form.setFlag(flag)
    })

    this.dash.listenToChildren<BoxListEvent>("boxListSortingUpdated").onData(data => {
      this.handleBoxlistUpdate(data)
    })
  }

  private listenToModel() {
    this.dash.listenTo<UpdateModelEvent>(this.model, "createFlag").onData(data => {
      let flag = data.model as FlagModel
      let box = this.dash.create(FlagBox, flag)
      this.boxList.addBox(box)
    })

    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteFlag").onData(data => {
      this.boxList.removeBox(data.id as string)
    })
  }

  private createChildComponents() {
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
    } as DropdownMenuOptions)
    this.menu.entries.createNavBtn({
      label: "Add new flag",
      onClick: () => this.form.switchToCreationMode()
    })
  }

  /**
   * Schedule the update of steps order.
   *
   * A timeout of 2s is used to schedule the update. The timer is restarted if the user
   * reorders the steps within the 2s.
   */
  private handleBoxlistUpdate(ev: BoxListEvent) {
    if (this.timer)
      clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.doUpdate(ev.boxIds)
    }, 2000)
  }

  /**
   * Save the new order of the flags in the model.
   *
   * If the changes are not accepted by the server, then it rollback them in the boxlist.
   *
   * @param ids - array of strings that contains the ids of steps
   */
  private async doUpdate(ids: string[]): Promise<void> {
    let currentOrder = this.boxList.getBoxesOrder()
    console.log(currentOrder)
    this.boxList.disable(true)
    try {
      let idList = await this.dash.app.model.reorder("Flag", ids)

      if (!equal(idList, ids)) {
        console.error("Sorry. Server rejected new order of flags...", idList, ids)
        this.boxList.setBoxesOrder(idList)
      }
    } catch (err) {
      console.log("Sorry. Unable to save the new order of flags on server.", err)
      this.boxList.setBoxesOrder(currentOrder)
      console.log(this.boxList.getBoxesOrder())
    }

    this.boxList.enable(true)
    this.form.reset()
  }

  private async fillBoxList() {
    this.model.global.flags.forEach(flag => {
        this.boxList.addBox(this.dash.create(FlagBox, flag))
    })
  }

  public activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el)
        .setTitleRightEl(this.menu.btnEl)
        .setTitle("Flags")
  }

  public deactivate() {
  }
}