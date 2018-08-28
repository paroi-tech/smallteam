import { Log } from "bkb"
import { render, LtMonkberryView } from "@fabtom/lt-monkberry"
import { OwnDash } from "../../../App/OwnDash"
import { Model, StepModel } from "../../../AppModel/AppModel"
import { DropdownMenu, DropdownMenuOptions } from "../../../generics/DropdownMenu/DropdownMenu"
import { createCustomMenuBtnEl } from "../../../generics/WorkspaceViewer/workspaceUtils"
import InfoDialog from "../../../../sharedFrontend/modalDialogs/InfoDialog/InfoDialog"

const template = require("./StepForm.monk")

export default class StepForm {
  readonly el: HTMLElement
  private fieldsetEl: HTMLFieldSetElement
  private nameEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private dropdownMenu: DropdownMenu
  private view: LtMonkberryView

  private currentStep: StepModel | undefined
  private model: Model
  private log: Log

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.view = render(template)
    this.el = this.view.rootEl()
    this.fieldsetEl = this.view.ref("fieldset")
    this.nameEl = this.view.ref("name")
    this.spinnerEl = this.view.ref("spinner")

    this.dropdownMenu = this.dash.create(DropdownMenu, {
        btnEl: createCustomMenuBtnEl()
      } as DropdownMenuOptions
    )
    this.dropdownMenu.entries.createNavBtn({
      label: "Delete step",
      onClick: () => this.deleteCurrentStep()
    })
    this.view.ref("menu").appendChild(this.dropdownMenu.btnEl)

    let btnEl = this.view.ref("submitBtn") as HTMLButtonElement
    btnEl.addEventListener("click", ev => {
      let name = this.nameEl.value.trim()
      if (name.length === 0) {
        this.log.warn("The name of the step should contain more characters.")
        return
      }
      this.updateStep(name)
    })
    this.view.ref("cancelBtn").addEventListener("click", ev => {
      this.clearContent()
      btnEl.setAttribute("disabled", "true")
      if (this.currentStep)
        this.updateView()
    })
    this.nameEl.addEventListener("keyup", ev => {
      if (!btnEl.getAttribute("disabled") && ev.key === "Enter")
        btnEl.click()
    })
    this.nameEl.addEventListener("input", ev => btnEl.removeAttribute("disabled"))

    this.dash.listenToModel("deleteStep", data => {
      if (this.currentStep && this.currentStep.id === data.id)
        this.reset()
    })
    this.dash.listenTo<StepModel>(this.model, "endProcessingStep", data => this.onEndProcessing(data))
    this.dash.listenTo<StepModel>(this.model, "processingStep", data => this.onProcessing(data))
  }

  public reset() {
    this.currentStep = undefined
    this.clearContent()
    this.unlockForm()
  }

  get step(): StepModel | undefined {
    return this.currentStep
  }

  set step(step: StepModel | undefined) {
    this.reset()
    if (!step)
      return
    this.currentStep = step
    this.updateView()
    if (this.currentStep.updateTools.processing)
      this.lockForm()
  }

  private onEndProcessing(step: StepModel) {
    if (!this.currentStep || this.currentStep.id !== step.id)
      return
    this.updateView()
    this.unlockForm()
  }

  private onProcessing(step: StepModel) {
    if (!this.currentStep || this.currentStep.id !== step.id)
      return
    this.lockForm()
  }

  // --
  // -- Model update functions
  // --

  private async updateStep(newName: string) {
    if (!this.currentStep)
      return

    let id = this.currentStep.id
    let frag = this.currentStep.updateTools.getDiffToUpdate({ id, label: newName })
    if (!frag || !(Object.keys(frag).length !== 0 || frag.constructor !== Object))
      return
    await this.model.exec("update", "Step", { id, ...frag })
  }

  private async deleteCurrentStep() {
    if (!this.currentStep)
      return
    try {
      let w = await this.currentStep.updateTools.whoUse()
      if (w) {
        await this.dash.create(InfoDialog).show("Can't delete step.")
        return
      }
      await this.model.exec("delete", "Step", { id: this.currentStep.id })
    } catch (error) {
      this.log.error(`Error while deleting Step with ID ${this.currentStep.id}`)
    }
  }

  // --
  // -- Utilities
  // --

  private updateView() {
    if (!this.currentStep)
      return
    this.view.update({
      name: this.currentStep.label,
      orderNum: (this.currentStep.orderNum || "").toString()
    })
  }

  private clearContent() {
    this.view.update({ name: "", orderNum: "" })
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