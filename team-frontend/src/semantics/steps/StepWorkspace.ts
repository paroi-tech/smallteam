import { Log } from "bkb"
import handledom from "handledom"
import { equal } from "../../../../shared-ui/libraries/utils"
import { OwnDash } from "../../AppFrame/OwnDash"
import { Model, StepModel } from "../../AppModel/AppModel"
import BoxList, { BoxListEvent } from "../../generics/BoxList"
import { ViewerController, Workspace } from "../../generics/WorkspaceViewer"
import StepBox from "./StepBox"
import StepForm from "./StepForm"

const template = handledom`
<div class="SelEditBoard">
  <div class="SelEditBoard-sel">
    <div h="sel"></div>
    <div class="InputAndBtn" h="add">
      <input class="InputAndBtn-input" type="text" h="input" required>
      <button class="InputAndBtn-btn Btn WithLoader -right" type="button" h="btn">
        Add
        <span class="WithLoader-l" hidden h="spinner"></span>
      </button>
    </div>
  </div>
  <div class="SelEditBoard-edit" h="edit"></div>
</div>
`

export default class StepWorkspace implements Workspace {
  readonly el: HTMLElement
  private nameEl: HTMLInputElement
  private spinnerEl: HTMLElement

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

    const { root, ref } = template()
    this.el = root
    this.nameEl = ref("input")
    this.spinnerEl = ref("spinner")

    const btnEl = ref("btn") as HTMLButtonElement
    btnEl.addEventListener("click", () => this.onAdd())
    this.nameEl.addEventListener("keyup", ev => {
      if (ev.key === "Enter")
        btnEl.click()
    })

    this.boxList = this.dash.create(BoxList, {
      sort: true
    })
    ref("sel").appendChild(this.boxList.el)
    this.form = this.dash.create(StepForm)
    ref("edit").appendChild(this.form.el)
    this.fillBoxList()

    this.dash.listenTo<StepModel>("stepBoxSelected", step => {
      this.form.setStep(step)
    })
    this.dash.listenTo<BoxListEvent>("boxListSortingUpdated", data => this.scheduleStepOrderUpdate(data))

    this.dash.listenToModel("createStep", data => {
      const step = data.model as StepModel
      const box = this.dash.create(StepBox, step)
      this.boxList.addBox(box)
    })
    this.dash.listenToModel("deleteStep", data => this.boxList.removeBox(data.id as string))
  }

  activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el).setTitle("Steps")
  }

  private onAdd() {
    const name = this.nameEl.value.trim()
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
    const currentOrder = this.boxList.getOrder()

    this.boxList.disable(true)
    try {
      const arr = await this.dash.app.model.reorder("Step", ids)
      if (!equal(arr, ids)) {
        console.error("Sorry. Server rejected new order of steps.", arr, ids)
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
    for (const step of this.model.global.steps) {
      if (!step.isSpecial)
        this.boxList.addBox(this.dash.create(StepBox, step))
    }
  }

  private async addStep(label: string) {
    this.spinnerEl.hidden = false
    try {
      await this.model.exec("create", "Step", { label })
      this.nameEl.value = ""
    } catch (err) {
      this.log.error("Unable to create new step...")
    }
    this.spinnerEl.hidden = true
    this.nameEl.focus()
  }
}
