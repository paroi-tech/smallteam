import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { exec } from "../Model/Model"
import { StepTypeModel } from "../Model/FragmentsModel"

const template = require("html-loader!./steptypeform.html")

export default class StepTypeForm {
  private $container: JQuery
  private $fieldContainer: JQuery
  private $stepTypeId: JQuery
  private $stepTypeName: JQuery
  private $stepTypeIndex: JQuery
  private $submitButton: JQuery

  private model: StepTypeModel | null

  constructor(private dash: Dash<App>) {
    this.model = null

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
      if (!this.model)
        return

      let newName = this.$stepTypeName.val().trim()
      if (newName.length == 0) {
        alert("The name of the step type should contain more characters...")
        return
      }

      this.updateModel(newName)
    })
  }

  public fillWith(model: StepTypeModel) {
    this.model = model
    this.$stepTypeId.val(model.id)
    this.$stepTypeName.val(model.name)
    if (model.orderNum)
      this.$stepTypeIndex.val(model.orderNum)
  }

  private updateModel(newName: string) {
    let oldName = this.model!.name
    let $indicator = this.$submitButton.find("span").show()

    this.model!.name = newName
    exec("update", "StepType", this.model!).then(newModel => {
      alert("Step type successfully updated...")
      this.model = newModel
      $indicator.hide()
    }).catch(err => {
      alert("Impossible to save the new step type...")
      this.model!.name = oldName
      this.$stepTypeName.val(oldName)
      $indicator.hide()
    })
  }

  public reset() {
    this.model = null
    this.$stepTypeId.val("")
    this.$stepTypeName.val("")
    this.$stepTypeIndex.val("")
  }
}