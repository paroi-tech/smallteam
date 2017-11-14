import { Dash } from "bkb"
import { render } from "monkberry"
import { DropdownMenu } from "../../../generics/DropdownMenu/DropdownMenu"
import { StepModel, Model, UpdateModelEvent } from "../../../AppModel/AppModel"
import App from "../../../App/App"

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

  private step: StepModel | undefined = undefined

  private model: Model

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createHtmlElements()
    this.createChildComponents()
    this.listenToChildren()
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
    this.dropdownMenu = this.dash.create(DropdownMenu, "right")
    this.dropdownMenu.addItem({
      id: "deleteCurrentStep",
      label: "Delete step"
    })
    this.menuContainerEl.appendChild(this.dropdownMenu.el)
  }

  private listenToChildren() {
    this.dash.listenTo(this.dropdownMenu, "select").onData(itemId => {
      if (itemId === "deleteCurrentStep")
        this.deleteCurrentStep()
    })
  }

  private listenToModel() {
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteStep").onData(data => {
      if (this.step && this.step.id === data.id)
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
      if (this.step)
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

  public setStep(step: StepModel) {
    this.clear()
    this.step = step
    this.fillFieldsWithCurrentStep()
  }

  private async updateStep(newName: string) {
    if (!this.step)
      return

    this.submitButtonSpinnerEl.style.display = "inline"
    let id = this.step.id
    let frag = this.step.updateTools.getDiffToUpdate({ id, label: newName })
    if (frag && (Object.keys(frag).length !== 0 || frag.constructor !== Object)) {
      try {
        let step = await this.model.exec("update", "Step", { id, ...frag })
        this.setStep(step)
        this.submitButtonEl.setAttribute("disabled", "true")
      } catch (err) {
        this.clear()
        if (this.step)
          this.setStep(this.step)
      }
    }
    this.submitButtonSpinnerEl.style.display = "none"
  }

  private async deleteCurrentStep() {
    if (!this.step)
      return
    try {
      let w = await this.step.updateTools.whoUse()
      if (w) {
        alert("Can't delete step.")
        return
      }
      await this.model.exec("delete", "Step", { id: this.step.id })
    } catch (error) {
      console.log(`Error while deleting Step with ID ${this.step.id}`)
    }
  }

  get currentStep(): StepModel | undefined {
    return this.step
  }

  public clear() {
    this.step = undefined
    this.clearFields()
  }

  private fillFieldsWithCurrentStep() {
    if (!this.step)
      return
      this.view.update({
        name: this.step.label,
        orderNum: (this.step.orderNum || "").toString()
      })
  }

  private clearFields() {
    this.view.update({
      name: "",
      orderNum: ""
    })
  }
}
