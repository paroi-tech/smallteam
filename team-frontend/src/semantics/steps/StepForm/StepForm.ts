require("./_StepForm.scss")
import { LtMonkberryView, render } from "@tomko/lt-monkberry"
import { Log } from "bkb"
import InfoDialog from "../../../../../shared-ui/modalDialogs/InfoDialog/InfoDialog"
import { OwnDash } from "../../../App/OwnDash"
import { Model, StepModel } from "../../../AppModel/AppModel"
import { DropdownMenu } from "../../../generics/DropdownMenu/DropdownMenu"
import { createCustomMenuBtnEl } from "../../../generics/WorkspaceViewer/workspaceUtils"

const template = require("./StepForm.monk")

export default class StepForm {
  readonly el: HTMLElement
  private fieldsetEl: HTMLFieldSetElement
  private nameEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private dropdownMenu: DropdownMenu
  private view: LtMonkberryView

  private step?: StepModel
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
    })
    this.dropdownMenu.entries.createNavBtn({
      label: "Delete step",
      onClick: () => this.deleteCurrentStep()
    })
    this.view.ref("menu").appendChild(this.dropdownMenu.btnEl)

    let btnEl = this.view.ref("submitBtn") as HTMLButtonElement

    btnEl.addEventListener("click", () => {
      let name = this.nameEl.value.trim()
      if (name.length === 0) {
        this.log.warn("The name of the step should contain more characters.")
        return
      }
      this.updateStep(name)
    })
    this.view.ref("cancelBtn").addEventListener("click", () => {
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

    let id = this.step.id
    let frag = this.step.updateTools.getDiffToUpdate({ id, label: newName })

    if (!frag || !(Object.keys(frag).length !== 0 || frag.constructor !== Object))
      return
    await this.model.exec("update", "Step", { ...frag, id })
  }

  private async deleteCurrentStep() {
    if (!this.step)
      return
    try {
      let w = await this.step.updateTools.whoUse()
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
    this.view.update({
      name: this.step.label,
      orderNum: (this.step.orderNum || "").toString()
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
