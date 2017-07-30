import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Model, StepTypeModel } from "../Model/Model"

const template = require("html-loader!./steptypeform.html")

/**
 * Component used to create and update step types.
 */
export default class StepTypeForm {
  private $container: JQuery
  private $fieldContainer: JQuery
  private $stepTypeId: JQuery
  private $stepTypeName: JQuery
  private $stepTypeIndex: JQuery
  private $submitButton: JQuery

  private stepType: StepTypeModel | undefined = undefined

  /**
   * Create a new StepTypeForm.
   *
   * Note that this component is only used to update step tyoes, not to create them.
   *
   * @param dash - the current application dash
   */
  constructor(private dash: Dash<App>) {
    this.initJQueryObjects()
    this.listenToForm()
  }

  /**
   * Create JQuery objects from template.
   */
  private initJQueryObjects() {
    this.$container = $(template)
    this.$fieldContainer = this.$container.find(".js-field-container")
    this.$stepTypeId = this.$fieldContainer.find(".js-steptype-id")
    this.$stepTypeName = this.$fieldContainer.find(".js-steptype-name")
    this.$stepTypeIndex = this.$fieldContainer.find(".js-steptype-index")
    this.$submitButton = this.$fieldContainer.find(".js-submit-btn")
  }

  /**
   * Add the panel as a child of an HTML element.
   *
   * @param el - element that the box will be added to.
   */
  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  /**
   * Add event handlers to events from the form fields.
   */
  private listenToForm() {
    this.$submitButton.click(ev => {
      let name = this.$stepTypeName.val() as string
      name = name.trim()
      if (name.length == 0)
        console.log("The name of the step type should contain more characters...")
      else {
        if (!this.stepType) // The user wants to create a new StepType
          this.addStepType(name)
        else
          this.updateStepType(name)
      }
    })
    // Validating the content of the $stepTypeName field triggers the $submitButton click event.
    this.$stepTypeName.keyup(ev => {
      if (ev.which == 13)
        this.$submitButton.trigger("click")
    })
  }

  /**
   * Fill the fields of the form with data from a step type.
   *
   * @param stepType - the step type to show in the form
   */
  public fillWith(stepType: StepTypeModel) {
    this.reset()
    this.stepType = stepType
    this.$stepTypeId.val(stepType.id)
    this.$stepTypeName.val(stepType.name)
    if (stepType.orderNum)
      this.$stepTypeIndex.val(stepType.orderNum)
  }

  /**
   * Add a new step type to the model.
   *
   * @param name - the name of the step type
   */
  private addStepType(name: string) {
    let $indicator = this.$submitButton.find("span").show()
    let fragUpd = {
      name: name
    }
    this.dash.app.model.exec("create", "StepType", fragUpd).then(stepType => {
      console.log(`Step type ${name} successfully created...`)
      this.fillWith(stepType)
      $indicator.hide()
      this.dash.emit("stepTypeCreated", stepType)
    }).catch(error => {
      console.error(`Impossible to create the step type ${name}...`, error)
      $indicator.hide()
    })
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
    let $indicator = this.$submitButton.find("span").show()
    let fragUpd = {
      id: this.stepType.id,
      name: newName
    }
    try {
      let stepType = await this.dash.app.model.exec("update", "StepType", fragUpd)
      console.log("Step type successfully updated...")
      this.fillWith(stepType)
      $indicator.hide()
      this.dash.emit("stepTypeUpdated", stepType) // TODO: [Paleo] Check if this event is required
    } catch (err) {
      console.error("Cannot update the step type.", err)
      this.reset()
      if (this.stepType)
        this.fillWith(this.stepType)
      $indicator.hide()
    }
  }

  /**
   * Reset the component state.
   *
   * Its fields are reinitialized and the embedded step type is set to `undefined`.
   */
  public reset() {
    this.stepType = undefined
    this.resetFields()
  }

  /**
   * Reset the fileds in the form.
   */
  private resetFields() {
    this.$stepTypeId.val("")
    this.$stepTypeName.val("")
    this.$stepTypeIndex.val("")
  }
}
