import * as $ from "jquery"
import { Dash, Bkb, Component } from "bkb"
import App from "../App/App"
import { Model, StepTypeModel } from "../Model/Model"
import { DropdownMenu } from "../DropdownMenu/DropdownMenu"
import { render } from "monkberry"
import * as template from "./steptypeform.monk"

/**
 * Component used to create and update step types.
 */
export default class StepTypeForm {
  readonly el: HTMLElement

  private dropdownMenuContainerEl: HTMLElement
  private fieldContainerEl: HTMLElement
  private stepTypeNameEl: HTMLInputElement
  private stepTypeIndexEl: HTMLInputElement
  private submitButton: HTMLButtonElement

  private dropdownMenu: Component<DropdownMenu>
  private view: MonkberryView

  private stepType: StepTypeModel | undefined = undefined

  private model: Model

  /**
   * Create a new StepTypeForm.
   *
   * Note that this component is only used to update step tyoes, not to create them.
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
    let wrapperEl = document.createElement("div")
    wrapperEl.classList.add("StepTypeForm")

    this.view = render(template, wrapperEl)
    this.dropdownMenuContainerEl = this.view.querySelector(".js-menu-container")
    this.fieldContainerEl = this.view.querySelector(".js-field-container")
    this.stepTypeNameEl = this.fieldContainerEl.querySelector(".js-steptype-name") as HTMLInputElement
    this.stepTypeIndexEl = this.fieldContainerEl.querySelector(".js-steptype-index") as HTMLInputElement
    this.submitButton = this.fieldContainerEl.querySelector(".js-submit-btn") as HTMLButtonElement

    return wrapperEl
  }

  /**
   * Create DropDownMenu subcomponent.
   */
  private createChildComponents() {
    this.dropdownMenu = this.dash.create(DropdownMenu, {
      args: ["ProjectFormDropdownMenu", "ProjectForm dropdown menu", "right"]
    })
    this.dropdownMenu.addItem({
      id: "deleteCurrentStepType",
      label: "Delete step type",
      eventName : "deleteCurrentStepType",
      data: undefined
    })
    this.dropdownMenuContainerEl.appendChild(this.dropdownMenu.el)
  }

  /**
   * Listen to events from child components.
   */
  private listenToChildren() {
    this.dropdownMenu.bkb.on("deleteCurrentStepType", "eventOnly", ev => {
      this.deleteCurrentStepType()
    })
  }

  /**
   * Listen to events from model.
   */
  private listenToModel() {
    this.model.on("change", "dataFirst", data => {
      if (!this.stepType || data.type !== "StepType" || data.cmd != "delete")
        return
      let id = data.id as string
      if (this.stepType.id === id)
        this.clear()
    })
  }

  /**
   * Add event handlers to events from the form fields.
   */
  private listenToForm() {
    this.submitButton.addEventListener("click", ev => {
      let name = this.stepTypeNameEl.value.trim()
      if (name.length === 0)
        console.log("The name of the step type should contain more characters...")
      else {
        if (!this.stepType) // The user wants to create a new StepType...
          this.addStepType(name)
        else
          this.updateStepType(name)
      }
    })
    // Validating the content of the $stepTypeName field triggers the $submitButton click event.
    this.stepTypeNameEl.addEventListener("keyup", ev => {
      if (ev.which == 13)
        this.submitButton.click()
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
    this.stepTypeNameEl.value = stepType.name
    if (stepType.orderNum)
      this.stepTypeIndexEl.value = stepType.orderNum.toString()
  }

  /**
   * Add a new step type to the model.
   *
   * @param name - the name of the step type
   */
  private async addStepType(name: string) {
    let indicatorEl = this.submitButton.querySelector("span")!
    indicatorEl.style.display = "inline"
    let fragUpd = { name }
    try {
      let stepType = await this.model.exec("create", "StepType", fragUpd)
      this.setStepType(stepType)
      this.dash.emit("stepTypeCreated", stepType)
    } catch (error) {
      console.error(`Impossible to create the step type ${name}...`, error)
    }
    indicatorEl.style.display = "none"
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
    // StepTypeModel | undefined, we have to mdo this control, or else the TS compiler won't be happy.
    // And I don't want to use the this.stepType! trick...
    if (!this.stepType)
      return
    let indicatorEl = this.submitButton.querySelector("span")!
    indicatorEl.style.display = "inline"
    let fragUpd = {
      id: this.stepType.id,
      name: newName
    }
    try {
      let stepType = await this.model.exec("update", "StepType", fragUpd)
      this.setStepType(stepType)
    } catch (err) {
      this.clear()
      if (this.stepType)
        this.setStepType(this.stepType)
    }
    indicatorEl.style.display = "none"
  }

  /**
   * Delete the form current StepType.
   */
  private async deleteCurrentStepType() {
    if (!this.stepType)
      return
    console.warn("Try to remove StepType...")
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

  /**
   * Reset the fileds in the form.
   */
  private clearFields() {
    this.stepTypeNameEl.value = ""
    this.stepTypeIndexEl.value = ""
  }
}
