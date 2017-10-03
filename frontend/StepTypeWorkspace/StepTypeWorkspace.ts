import App from "../App/App"
import { Dash, Bkb } from "bkb"
import { Workspace, ViewerController } from "../WorkspaceViewer/WorkspaceViewer"
import StepTypeForm from "../StepTypeForm/StepTypeForm"
import StepTypeBox from "../StepTypeBox/StepTypeBox"
import BoxList, { Box, BoxListParams, BoxEvent, BoxListEvent } from "../BoxList/BoxList"
import { Model, StepTypeModel } from "../AppModel/AppModel"
import { equal } from "../libraries/utils"
import { UpdateModelEvent } from "../AppModel/ModelEngine"
import { render } from "monkberry"

import * as template from "./steptypeworkspace.monk"

export default class StepTypeWorkspace implements Workspace {
  readonly el: HTMLElement

  private boxListContainerEl: HTMLElement
  private formContainerEl: HTMLElement
  private addBtnEl: HTMLButtonElement
  private nameEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private view: MonkberryView

  private boxList: BoxList<StepTypeBox>
  private form: StepTypeForm

  private model: Model

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
    this.formContainerEl = el.querySelector(".js-edit-form-container") as HTMLElement
    this.addBtnEl = el.querySelector(".js-add-form-btn") as HTMLButtonElement
    this.spinnerEl = el.querySelector(".fa-spinner") as HTMLElement
    this.nameEl = el.querySelector(".js-input") as HTMLInputElement

    this.nameEl.onkeyup = ev => {
      if (ev.key === "Enter")
        this.addBtnEl.click()
    }
    this.addBtnEl.onclick = (ev) => this.onAdd()

    return el
  }

  private listenToChildComponents() {
    this.dash.listenToChildren<StepTypeModel>("stepTypeBoxSelected").onData(stepType => {
      this.form.setStepType(stepType)
    })
    this.dash.listenToChildren<BoxListEvent>("boxListSortingUpdated").onData(data => {
      this.handleBoxlistUpdate(data)
    })

  }

  /**
   * Listen to events from model.
   * Handled events are:
   *  - StepType creation
   */
  private listenToModel() {
    // StepType creation.
    this.dash.listenTo<UpdateModelEvent>(this.model, "createStepType").onData(data => {
      let stepType = data.model as StepTypeModel
      let box = this.dash.create(StepTypeBox, stepType)
      this.boxList.addBox(box)
    })
    // StepType deletion.
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteStepType").onData(data => {
      this.boxList.removeBox(data.id as string)
    })
  }

  /**
   * Initialize the BoxList and Form components of the panel.
   */
  private createChildComponents() {
    this.boxList = this.dash.create(BoxList, {
      id: "",
      name: "Step types",
      group: undefined,
      sort: true
    })
    this.boxListContainerEl.appendChild(this.boxList.el)

    this.form = this.dash.create(StepTypeForm)
    this.formContainerEl.appendChild(this.form.el)
  }

  /**
   * Handle click on the `Add` button.
   *
   * If the name typed by the user is valid, it then calls the `addStepType` method.
   */
  private onAdd() {
    let name = this.nameEl.value.trim()
    if (name.length > 0)
      this.addStepType(name)
    else {
      console.log("The name you entered for the step type is invalid.")
      this.nameEl.focus()
    }
  }

  /**
   * Schedule the update of step types order.
   *
   * A timeout of 2s is used to schedule the update. The timer is restarted if the user
   * reorders the step types within the 2s.
   */
  private handleBoxlistUpdate(ev: BoxListEvent) {
    if (this.timer)
      clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.doUpdate(ev.boxIds)
    }, 2000)
  }

  /**
   * Save the new order of the step types in the model.
   *
   * If the changes are not accepted by the server, then it rollback them in the boxlist.
   *
   * @param ids - array of strings that contains the ids of step types
   */
  private async doUpdate(ids: string[]): Promise<void> {
    let currentOrder = this.boxList.getBoxesOrder()

    this.boxList.disable(true)
    try {
      let idList = await this.dash.app.model.reorder("StepType", ids)

      if (!equal(idList, ids)) {
        console.error("Sorry. Server rejected new order of step types...", idList, ids)
        this.boxList.setBoxesOrder(idList)
      }
    } catch (err) {
      console.log("Sorry. Unable to save the new order of steps on server.", err)
      this.boxList.setBoxesOrder(currentOrder)
    }

    this.boxList.enable(true)
    this.form.clear()
  }

  private async fillBoxList() {
    this.model.global.stepTypes.forEach(stepType => {
      if (!stepType.isSpecial)
        this.boxList.addBox(this.dash.create(StepTypeBox, stepType))
    })
  }

  private async addStepType(name: string) {
    this.spinnerEl.style.display = "inline"
    try {
      await this.model.exec("create", "StepType", { name })
      this.nameEl.value = ""
    } catch (err) {
      console.error("Unable to create new step type...")
    }
    this.spinnerEl.style.display = "none"
    this.nameEl.focus()
  }

  public activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el)
        .setTitle("Step types")
  }

  public deactivate() {
  }
}
