import { Dash } from "bkb"
import { render } from "monkberry"
import { DropdownMenu, DropdownMenuOptions } from "../../../generics/DropdownMenu/DropdownMenu"
import { StepModel, Model, UpdateModelEvent } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { createCustomMenuBtnEl } from "../../../generics/WorkspaceViewer/workspaceUtils";

const template = require("./StepForm.monk")

export default class StepForm {
  readonly el: HTMLElement

  private menuContainerEl: HTMLElement
  private fieldContainerEl: HTMLElement
  private nameEl: HTMLInputElement
  private submitButtonEl: HTMLButtonElement
  private cancelButtonEl: HTMLButtonElement
  private submitButtonSpinnerEl: HTMLElement

  private dropdownMenu: DropdownMenu
  private view: MonkberryView

  private currentStep: StepModel | undefined
  private model: Model

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createHtmlElements()
    this.createChildComponents()
    this.listenToForm()
    this.listenToModel()
  }

  private createHtmlElements() {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLDivElement

    this.menuContainerEl = el.querySelector(".js-menu-container") as HTMLElement
    this.fieldContainerEl = el.querySelector(".js-field-container") as HTMLElement
    this.nameEl = this.fieldContainerEl.querySelector(".js-name") as HTMLInputElement
    this.submitButtonEl = this.fieldContainerEl.querySelector(".js-submit-btn") as HTMLButtonElement
    this.submitButtonSpinnerEl = this.fieldContainerEl.querySelector(".fa-spinner") as HTMLElement
    this.cancelButtonEl = this.fieldContainerEl.querySelector(".js-cancel-btn") as HTMLButtonElement

    return el
  }

  private createChildComponents() {
    this.dropdownMenu = this.dash.create(DropdownMenu, {
      btnEl: createCustomMenuBtnEl()
    } as DropdownMenuOptions)
    this.dropdownMenu.entries.createNavBtn({
      label: "Delete step",
      onClick: () => this.deleteCurrentStep()
    })
    this.menuContainerEl.appendChild(this.dropdownMenu.btnEl)
  }

  private listenToModel() {
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteStep").onData(data => {
      if (this.currentStep && this.currentStep.id === data.id)
        this.clear()
    })
  }

  private listenToForm() {
    // Submit button click.
    this.submitButtonEl.addEventListener("click", ev => {
      let name = this.nameEl.value.trim()
      if (name.length === 0) {
        console.log("The name of the step should contain more characters...")
        return
      }
      this.updateStep(name)
    })

    // Cancel button click.
    this.cancelButtonEl.addEventListener("click", ev => {
      this.clearFields()
      this.submitButtonEl.setAttribute("disabled", "true")
      if (this.currentStep)
        this.fillFieldsWithCurrentStep()
    })

    // Validating the content of the $stepName field triggers the $submitButton click event.
    this.nameEl.addEventListener("keyup", ev => {
      if (!this.submitButtonEl.getAttribute("disabled") && ev.key === "Enter")
        this.submitButtonEl.click()
    })

    // Editing the value of the Step name field enables the submit button.
    this.nameEl.addEventListener("input", ev => {
      this.submitButtonEl.removeAttribute("disabled")
    })
  }

  private async updateStep(newName: string) {
    if (!this.currentStep)
      return

    this.submitButtonSpinnerEl.style.display = "inline"
    let id = this.currentStep.id
    let frag = this.currentStep.updateTools.getDiffToUpdate({ id, label: newName })
    if (frag && (Object.keys(frag).length !== 0 || frag.constructor !== Object)) {
      try {
        let step = await this.model.exec("update", "Step", { id, ...frag })
        this.step = step
        this.submitButtonEl.setAttribute("disabled", "true")
      } catch (err) {
        this.clear()
        if (this.currentStep)
          this.step = this.currentStep
      }
    }
    this.submitButtonSpinnerEl.style.display = "none"
  }

  private async deleteCurrentStep() {
    if (!this.currentStep)
      return
    try {
      let w = await this.currentStep.updateTools.whoUse()
      if (w) {
        alert("Can't delete step.")
        return
      }
      await this.model.exec("delete", "Step", { id: this.currentStep.id })
    } catch (error) {
      console.log(`Error while deleting Step with ID ${this.currentStep.id}`)
    }
  }

  get step(): StepModel | undefined {
    return this.currentStep
  }

  set step(step: StepModel | undefined) {
    if (!step) {
      this.clear()
      return
    }
    this.currentStep = step
    this.fillFieldsWithCurrentStep()
  }

  public clear() {
    this.currentStep = undefined
    this.clearFields()
  }

  private fillFieldsWithCurrentStep() {
    if (!this.currentStep)
      return
      this.view.update({
        name: this.currentStep.label,
        orderNum: (this.currentStep.orderNum || "").toString()
      })
  }

  private clearFields() {
    this.view.update({
      name: "",
      orderNum: ""
    })
  }
}
