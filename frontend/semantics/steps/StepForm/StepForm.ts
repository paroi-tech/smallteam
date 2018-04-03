import { Dash, Log } from "bkb"
import { render } from "monkberry"
import { DropdownMenu, DropdownMenuOptions } from "../../../generics/DropdownMenu/DropdownMenu"
import { StepModel, Model, UpdateModelEvent } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { createCustomMenuBtnEl } from "../../../generics/WorkspaceViewer/workspaceUtils"
import InfoDialog from "../../../generics/modal-dialogs/InfoDialog/InfoDialog"
import { OwnDash } from "../../../App/OwnDash";

const template = require("./StepForm.monk")

export default class StepForm {
  readonly el: HTMLElement
  private menuContainerEl: HTMLElement
  private fieldContainerEl: HTMLElement
  private fieldsetEl: HTMLFieldSetElement
  private nameEl: HTMLInputElement
  private submitButtonEl: HTMLButtonElement
  private cancelButtonEl: HTMLButtonElement
  private submitButtonSpinnerEl: HTMLElement

  private dropdownMenu: DropdownMenu
  private view: MonkberryView

  private currentStep: StepModel | undefined
  private model: Model
  private log: Log

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLDivElement
    this.menuContainerEl = this.el.querySelector(".js-menu-container") as HTMLElement
    this.fieldContainerEl = this.el.querySelector(".js-field-container") as HTMLElement
    this.fieldsetEl = this.el.querySelector("fieldset") as HTMLFieldSetElement
    this.nameEl = this.fieldContainerEl.querySelector(".js-name") as HTMLInputElement
    this.submitButtonEl = this.fieldContainerEl.querySelector(".js-submitBtn") as HTMLButtonElement
    this.submitButtonSpinnerEl = this.fieldContainerEl.querySelector(".fa-spinner") as HTMLElement
    this.cancelButtonEl = this.fieldContainerEl.querySelector(".js-cancel-btn") as HTMLButtonElement

    this.dropdownMenu = this.dash.create(DropdownMenu, {
      btnEl: createCustomMenuBtnEl()
    } as DropdownMenuOptions
    )
    this.dropdownMenu.entries.createNavBtn({
      label: "Delete step",
      onClick: () => this.deleteCurrentStep()
    })
    this.menuContainerEl.appendChild(this.dropdownMenu.btnEl)

    this.listenToForm()

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

  // --
  // -- Initialization functions
  // --

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

  private listenToForm() {
    this.submitButtonEl.addEventListener("click", ev => {
      let name = this.nameEl.value.trim()
      if (name.length === 0) {
        this.log.warn("The name of the step should contain more characters...")
        return
      }
      this.updateStep(name)
    })

    this.cancelButtonEl.addEventListener("click", ev => {
      this.clearContent()
      this.submitButtonEl.setAttribute("disabled", "true")
      if (this.currentStep)
        this.updateView()
    })

    // Validating the content of the name field triggers the submit button click event.
    this.nameEl.addEventListener("keyup", ev => {
      if (!this.submitButtonEl.getAttribute("disabled") && ev.key === "Enter")
        this.submitButtonEl.click()
    })

    // Editing the value of the name field enables the submit button.
    this.nameEl.addEventListener("input", ev => this.submitButtonEl.removeAttribute("disabled"))
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
    this.submitButtonSpinnerEl.style.display = "inline"
  }

  private hideSpinner() {
    this.submitButtonSpinnerEl.style.display = "none"
  }
}
