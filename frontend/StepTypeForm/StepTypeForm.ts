import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Model, StepTypeModel } from "../AppModel/AppModel"
import { DropdownMenu } from "../DropdownMenu/DropdownMenu"
import { render } from "monkberry"
import * as template from "./steptypeform.monk"
import { UpdateModelEvent } from "../AppModel/ModelEngine"

export default class StepTypeForm {
  readonly el: HTMLElement

  private menuContainerEl: HTMLElement
  private fieldContainerEl: HTMLElement
  private nameEl: HTMLInputElement
  private orderNumEl: HTMLInputElement
  private submitButtonEl: HTMLButtonElement
  private cancelButtonEl: HTMLButtonElement
  private submitButtonSpinnerEl: HTMLElement

  private dropdownMenu: DropdownMenu
  private view: MonkberryView

  private stepType: StepTypeModel | undefined = undefined

  private model: Model

  /**
   * Create a new StepTypeForm.
   *
   * Note that this component is only used to update step types, not to create them.
   *
   * @param dash - the current application dash
   */
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
    this.orderNumEl = this.fieldContainerEl.querySelector(".js-ordernum-index") as HTMLInputElement
    this.submitButtonEl = this.fieldContainerEl.querySelector(".js-submit-btn") as HTMLButtonElement
    this.submitButtonSpinnerEl = this.fieldContainerEl.querySelector(".fa-spinner") as HTMLElement
    this.cancelButtonEl = this.fieldContainerEl.querySelector(".js-cancel-btn") as HTMLButtonElement

    return el
  }

  private createChildComponents() {
    this.dropdownMenu = this.dash.create(DropdownMenu, "right")
    this.dropdownMenu.addItem({
      id: "deleteCurrentStepType",
      label: "Delete step type"
    })
    this.menuContainerEl.appendChild(this.dropdownMenu.el)
  }

  private listenToChildren() {
    this.dash.listenTo(this.dropdownMenu, "select").onData(itemId => {
      if (itemId === "deleteCurrentStepType")
        this.deleteCurrentStepType()
    })
  }

  private listenToModel() {
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteStepType").onData(data => {
      if (this.stepType && this.stepType.id === data.id)
        this.clear()
    })
  }

  private listenToForm() {
    // Submit button click.
    this.submitButtonEl.addEventListener("click", ev => {
      let name = this.nameEl.value.trim()
      if (name.length === 0) {
        console.log("The name of the step type should contain more characters...")
        return
      }
      this.updateStepType(name)
    })

    // Cancel button click.
    this.cancelButtonEl.addEventListener("click", ev => {
      this.clearFields()
      this.submitButtonEl.setAttribute("disabled", "true")
      if (this.stepType)
        this.fillFieldsWithCurrentStepType()
    })

    // Validating the content of the $stepTypeName field triggers the $submitButton click event.
    this.nameEl.addEventListener("keyup", ev => {
      if (!this.submitButtonEl.getAttribute("disabled") && ev.key === "Enter")
        this.submitButtonEl.click()
    })

    // Editing the value of the StepType name field enables the submit button.
    this.nameEl.addEventListener("input", ev => {
      this.submitButtonEl.removeAttribute("disabled")
    })
  }

  public setStepType(stepType: StepTypeModel) {
    this.clear()
    this.stepType = stepType
    this.fillFieldsWithCurrentStepType()
  }

  private async updateStepType(newName: string) {
    if (!this.stepType)
      return
    this.submitButtonSpinnerEl.style.display = "inline"
    let fragUpd = {
      id: this.stepType.id,
      name: newName
    }
    try {
      let stepType = await this.model.exec("update", "StepType", fragUpd)
      this.setStepType(stepType)
      this.submitButtonEl.setAttribute("disabled", "true")
    } catch (err) {
      this.clear()
      if (this.stepType)
        this.setStepType(this.stepType)
    }
    this.submitButtonSpinnerEl.style.display = "none"
  }

  private async deleteCurrentStepType() {
    if (!this.stepType)
      return
    try {
      let w = await this.stepType.whoUse()
      if (w.length !== 0) {
        alert("Can't delete step type.")
        return
      }
      await this.model.exec("delete", "StepType", { id: this.stepType.id })
    } catch (error) {
      console.log(`Error while deleting StepType with ID ${this.stepType.id}`)
    }
  }

  get currentStepType(): StepTypeModel | undefined {
    return this.stepType
  }

  public clear() {
    this.stepType = undefined
    this.clearFields()
  }

  private fillFieldsWithCurrentStepType() {
    if (!this.stepType)
      return
      this.view.update({
        name: this.stepType.name,
        orderNum: (this.stepType.orderNum || "").toString()
      })
  }

  private clearFields() {
    this.view.update({
      name: "",
      orderNum: ""
    })
  }
}
