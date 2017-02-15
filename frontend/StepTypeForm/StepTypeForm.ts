import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import Model, { StepTypeModel } from "../Model/Model"

const template = require("html-loader!./steptypeform.html")

export default class StepTypeForm {
  private model: Model

  private $container: JQuery
  private $fieldContainer: JQuery
  private $stepTypeId: JQuery
  private $stepTypeName: JQuery
  private $stepTypeIndex: JQuery
  private $submitButton: JQuery

  private stepType: StepTypeModel | null

  constructor(private dash: Dash<App>) {
    this.model = dash.app.model
    this.stepType = null

    this.$container = $(template)
    this.$fieldContainer = this.$container.find(".js-field-container")
    this.$stepTypeId = this.$fieldContainer.find(".js-steptype-id")
    this.$stepTypeName = this.$fieldContainer.find(".js-steptype-name")
    this.$stepTypeIndex = this.$fieldContainer.find(".js-steptype-index")
    this.$submitButton = this.$fieldContainer.find(".js-submit-btn")

    this.listenToForm()
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  private listenToForm() {
    this.$submitButton.click(ev => {
      if (!this.stepType)
        return

      let newName = this.$stepTypeName.val().trim()
      if (newName.length == 0) {
        alert("The name of the step type should contain more characters...")
        return
      }

      this.updateModel(newName)
    })
  }

  public fillWith(stepType: StepTypeModel) {
    this.stepType = stepType
    this.$stepTypeId.val(stepType.id)
    this.$stepTypeName.val(stepType.name)
    if (stepType.orderNum)
      this.$stepTypeIndex.val(stepType.orderNum)
  }

  private updateModel(newName: string) {
    let oldName = this.stepType!.name
    let $indicator = this.$submitButton.find("span").show()

    this.stepType!.name = newName
    this.model.exec("update", "StepType", this.stepType!).then(newModel => {
      alert("Step type successfully updated...")
      this.stepType = newModel
      $indicator.hide()
    }).catch(err => {
      alert("Impossible to save the new step type...")
      this.stepType!.name = oldName
      this.$stepTypeName.val(oldName)
      $indicator.hide()
    })
  }

  public reset() {
    this.stepType = null
    this.$stepTypeId.val("")
    this.$stepTypeName.val("")
    this.$stepTypeIndex.val("")
  }
}