import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Model, StepTypeModel } from "../AppModel/AppModel"
import { DropdownMenu } from "../DropdownMenu/DropdownMenu"
import { render } from "monkberry"
import * as template from "./steptypeform.monk"
import { UpdateModelEvent } from "../AppModel/ModelEngine"

/**
 * Component used to create and update step types.
 */
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

  /**
   * Create StepTypeForm HTML elements.
   */
  private createHtmlElements() {
    let el = document.createElement("div")
    el.classList.add("StepTypeForm")

    this.view = render(template, el)
    this.menuContainerEl = el.querySelector(".js-menu-container") as HTMLElement
    this.fieldContainerEl = el.querySelector(".js-field-container") as HTMLElement
    this.nameEl = this.fieldContainerEl.querySelector(".js-name") as HTMLInputElement
    this.orderNumEl = this.fieldContainerEl.querySelector(".js-ordernum-index") as HTMLInputElement
    this.submitButtonEl = this.fieldContainerEl.querySelector(".js-submit-btn") as HTMLButtonElement
    this.submitButtonSpinnerEl = this.fieldContainerEl.querySelector(".fa-spinner") as HTMLElement
    this.cancelButtonEl = this.fieldContainerEl.querySelector(".js-cancel-btn") as HTMLButtonElement

    return el
  }

  /**
   * Create DropDownMenu subcomponent.
   */
  private createChildComponents() {
    this.dropdownMenu = this.dash.create(DropdownMenu, "right")
    this.dropdownMenu.addItem({
      id: "deleteCurrentStepType",
      label: "Delete step type"
    })
    this.menuContainerEl.appendChild(this.dropdownMenu.el)
  }

  /**
   * Listen to events from child components.
   */
  private listenToChildren() {
    this.dash.listenTo(this.dropdownMenu, "select").onData(itemId => {
      if (itemId === "deleteCurrentStepType")
        this.deleteCurrentStepType()
    })
  }

  /**
   * Listen to events from model.
   */
  private listenToModel() {
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteStepType").onData(data => {
      if (this.stepType && this.stepType.id === data.id)
        this.clear()
    })
  }

  /**
   * Add event handlers to events from the form fields.
   */
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
      if (!this.submitButtonEl.getAttribute("disabled") && ev.which === 13)
        this.submitButtonEl.click()
    })

    // Editing the value of the StepType name field enables the submit button.
    this.nameEl.addEventListener("input", ev => {
      this.submitButtonEl.removeAttribute("disabled")
    })
  }

  /**
   * Fill the fields of the form with data from a step type.
   *
   * @param stepType - the step type to show in the form
   */
  public setStepType(stepType: StepTypeModel) {
    this.clear()
    this.stepType = stepType
    this.fillFieldsWithCurrentStepType()
  }

  /**
   * Update the current step type in the model.
   *
   * If the update fails, the old name of the step type is kept back
   *
   * @param newName - the new name of the step type
   */
  private async updateStepType(newName: string) {
    // The stepType attribute can't be undefined in this function, but since its type is
    // StepTypeModel | undefined, we have to do this control, or else the TS compiler won't be happy.
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

  /**
   * Delete the form current StepType.
   */
  private async deleteCurrentStepType() {
    if (!this.stepType)
      return
    console.warn("StepType deletion is not implemented...")
    // try {
    //   let w = await this.stepType.whoUse()
    //   if (w.length !== 0)
    //     return
    //   await this.model.exec("delete", "StepType", { id: this.stepType.id })
    // } catch (error) {
    //   console.log(`Error while deleting StepType with ID: ${this.stepType.id} in StepTypeForm`)
    // }
  }

  /**
   * Return the StepTypeModel the form is currently working on.
   */
  get currentStepType(): StepTypeModel | undefined {
    return this.stepType
  }

  /**
   * Reset the component state.
   *
   * Its fields are reinitialized and the embedded step type is set to `undefined`.
   */
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

  /**
   * Reset the fields in the form.
   */
  private clearFields() {
    this.view.update({
      name: "",
      orderNum: ""
    })
  }
}
