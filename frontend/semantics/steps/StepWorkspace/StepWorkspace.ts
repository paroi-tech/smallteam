import { Dash, Log } from "bkb"
import { render } from "monkberry"
import StepForm from "../StepForm/StepForm"
import StepBox from "../StepBox/StepBox"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import BoxList, { BoxListEvent } from "../../../generics/BoxList/BoxList"
import { Model, StepModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { equal } from "../../../libraries/utils"
import { OwnDash } from "../../../App/OwnDash";

const template = require("./StepWorkspace.monk")

export default class StepWorkspace implements Workspace {
  readonly el: HTMLElement
  private boxListContainerEl: HTMLElement
  private formContainerEl: HTMLElement
  private addBtnEl: HTMLButtonElement
  private nameEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private view: MonkberryView

  private boxList: BoxList<StepBox>
  private form: StepForm

  private model: Model
  private log: Log

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
    this.formContainerEl = this.el.querySelector(".js-edit-form-container") as HTMLElement
    this.addBtnEl = this.el.querySelector(".js-add-form-btn") as HTMLButtonElement
    this.spinnerEl = this.el.querySelector(".fa-spinner") as HTMLElement
    this.nameEl = this.el.querySelector(".js-input") as HTMLInputElement
    this.nameEl.onkeyup = ev => {
      if (ev.key === "Enter")
        this.addBtnEl.click()
    }
    this.addBtnEl.onclick = (ev) => this.onAdd()

    this.boxList = this.dash.create(BoxList, {
      id: "",
      name: "Steps",
      group: undefined,
      sort: true
    })
    this.boxListContainerEl.appendChild(this.boxList.el)

    this.form = this.dash.create(StepForm)
    this.formContainerEl.appendChild(this.form.el)

    this.fillBoxList()

    this.dash.listenTo<StepModel>("stepBoxSelected", step => {
      this.form.step = step
    })
    this.dash.listenTo<BoxListEvent>("boxListSortingUpdated", data => this.scheduleStepOrderUpdate(data))

    // Step creation.
    this.dash.listenToModel("createStep", data => {
      let step = data.model as StepModel
      let box = this.dash.create(StepBox, step)
      this.boxList.addBox(box)
    })
    // Step deletion.
    this.dash.listenToModel("deleteStep", data => this.boxList.removeBox(data.id as string))
  }

  private onAdd() {
    let name = this.nameEl.value.trim()
    if (name.length > 0)
      this.addStep(name)
    else {
      this.log.warn("The name you entered for the step is invalid.")
      this.nameEl.focus()
    }
  }

  private scheduleStepOrderUpdate(ev: BoxListEvent) {
    if (this.timer)
      clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.doStepOrderUpdate(ev.boxIds)
    }, 2000)
  }

  private async doStepOrderUpdate(ids: string[]): Promise<void> {
    let currentOrder = this.boxList.getOrder()

    this.boxList.disable(true)
    try {
      let arr = await this.dash.app.model.reorder("Step", ids)
      if (!equal(arr, ids)) {
        console.error("Sorry. Server rejected new order of steps...", arr, ids)
        this.boxList.sort(arr)
      }
    } catch (err) {
      this.log.info("Sorry. Unable to save the new order of steps on server.", err)
      this.boxList.sort(currentOrder)
    }
    this.boxList.enable(true)
    this.form.reset()
  }

  private async fillBoxList() {
    for (let step of this.model.global.steps) {
      if (!step.isSpecial)
        this.boxList.addBox(this.dash.create(StepBox, step))
    }
  }

  private async addStep(label: string) {
    this.spinnerEl.style.display = "inline"
    try {
      await this.model.exec("create", "Step", { label })
      this.nameEl.value = ""
    } catch (err) {
      this.log.error("Unable to create new step...")
    }
    this.spinnerEl.style.display = "none"
    this.nameEl.focus()
  }

  public activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el).setTitle("Steps")
  }

  public deactivate() {
  }
}
