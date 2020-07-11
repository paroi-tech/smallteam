import InfoDialog from "@smallteam-local/shared-ui/modal-dialogs/InfoDialog"
import { Log } from "bkb"
import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { Model, StepModel } from "../../AppModel/AppModel"
import { DropdownMenu } from "../../generics/DropdownMenu"
import { createCustomMenuBtnEl } from "../../generics/workspaceUtils"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.StepForm {
  width: 400px;

  &-header {
    align-items: baseline;
    background-color: #205081;
    color: white;
    display: flex;
    flex-direction: row;
    font-weight: bold;
    justify-content: space-between;
  }
}
`

const template = handledom`
<div class="StepForm">
  <header class="StepForm-header BlockTitle">
    <span>Step</span>
    <div h="menu"></div>
  </header>

  <div h="form">
    <fieldset class="FieldGroup" h="fieldset">
      <label class="FieldGroup-item Field">
        <span class="Field-lbl">Name</span>
        <input class="Field-input" type="text" required value={{ name }} h="name">
      </label>

      <div class="FieldGroup-action">
        <button class="Btn WithLoader -right" type="button" disabled h="submitBtn">
          Submit
          <span class="WithLoader-l" hidden h="spinner"></span>
        </button>
        &nbsp;
        <button type="button" h="cancelBtn">Cancel</button>
      </div>
    </fieldset>
  </div>
</div>
`

export default class StepForm {
  readonly el: HTMLElement
  private fieldsetEl: HTMLFieldSetElement
  private nameEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private dropdownMenu: DropdownMenu
  private update: (args: any) => void

  private step?: StepModel
  private model: Model
  private log: Log

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    const { root, ref, update } = template()
    this.update = update
    this.el = root
    this.fieldsetEl = ref("fieldset")
    this.nameEl = ref("name")
    this.spinnerEl = ref("spinner")

    this.dropdownMenu = this.dash.create(DropdownMenu, {
      btnEl: createCustomMenuBtnEl()
    })
    this.dropdownMenu.entries.createNavBtn({
      label: "Delete step",
      onClick: () => this.deleteCurrentStep()
    })
    ref("menu").appendChild(this.dropdownMenu.btnEl)

    const btnEl = ref("submitBtn") as HTMLButtonElement

    btnEl.addEventListener("click", () => {
      const name = this.nameEl.value.trim()
      if (name.length === 0) {
        this.log.warn("The name of the step should contain more characters.")
        return
      }
      this.updateStep(name).catch(err => this.dash.log.error(err))
    })
    ref("cancelBtn").addEventListener("click", () => {
      this.clearContent()
      btnEl.setAttribute("disabled", "true")
      if (this.step)
        this.updateView()
    })
    this.nameEl.addEventListener("keyup", ev => {
      if (!btnEl.getAttribute("disabled") && ev.key === "Enter")
        btnEl.click()
    })
    this.nameEl.addEventListener("input", () => btnEl.removeAttribute("disabled"))

    this.dash.listenToModel("deleteStep", data => {
      if (this.step && this.step.id === data.id)
        this.reset()
    })
    this.dash.listenTo<StepModel>(this.model, "endProcessingStep", data => this.onEndProcessing(data))
    this.dash.listenTo<StepModel>(this.model, "processingStep", data => this.onProcessing(data))
  }

  reset() {
    this.step = undefined
    this.clearContent()
    this.unlockForm()
  }

  getStep() {
    return this.step
  }

  setStep(step: StepModel) {
    this.reset()
    this.step = step
    this.updateView()
    if (this.step.updateTools.processing)
      this.lockForm()
  }

  private onEndProcessing(step: StepModel) {
    if (!this.step || this.step.id !== step.id)
      return
    this.updateView()
    this.unlockForm()
  }

  private onProcessing(step: StepModel) {
    if (!this.step || this.step.id !== step.id)
      return
    this.lockForm()
  }

  // --
  // -- Model update functions
  // --

  private async updateStep(newName: string) {
    if (!this.step)
      return

    const id = this.step.id
    const frag = this.step.updateTools.getDiffToUpdate({ id, label: newName })

    if (!frag || !(Object.keys(frag).length !== 0 || frag.constructor !== Object))
      return
    await this.model.exec("update", "Step", { ...frag, id })
  }

  private async deleteCurrentStep() {
    if (!this.step)
      return
    try {
      const w = await this.step.updateTools.whoUse()
      if (w) {
        await this.dash.create(InfoDialog).show("Can't delete step.")
        return
      }
      await this.model.exec("delete", "Step", { id: this.step.id })
    } catch (error) {
      this.log.error(`Error while deleting Step with ID ${this.step.id}`)
    }
  }

  // --
  // -- Utilities
  // --

  private updateView() {
    if (!this.step)
      return
    this.update({
      name: this.step.label,
      orderNum: (this.step.orderNum || "").toString()
    })
  }

  private clearContent() {
    this.update({ name: "", orderNum: "" })
  }

  private lockForm() {
    this.fieldsetEl.disabled = true
    this.dropdownMenu.disable()
    this.showSpinner()
  }

  private unlockForm() {
    this.fieldsetEl.disabled = false
    this.dropdownMenu.enable()
    this.hideSpinner()
  }

  private showSpinner() {
    this.spinnerEl.hidden = false
  }

  private hideSpinner() {
    this.spinnerEl.hidden = true
  }
}
