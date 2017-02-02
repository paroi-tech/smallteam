import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import App from "../App/App"
import { createStepType } from "../Model/Model"

const template = require("html-loader!./projectform.html")

export default class StepTypeForm {
  static readonly componentName = "ProjectForm"
  readonly bkb: Bkb

  private $container: JQuery
  private $form: JQuery
  private $stepTypeName: JQuery
  private $stepTypeIndex: JQuery
  private $submitButton: JQuery

  constructor(private dash: Dash<App>) {
    this.$container = $(template)
    this.$form = this.$container.find(".js-form")
    this.$stepTypeName = this.$form.find(".js-steptype-name")
    this.$stepTypeIndex = this.$form.find(".js-steptype-index")
    this.$submitButton = this.$form.find("js-submit-btn")
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  private listenToForm() {
    this.$submitButton.click(ev => {
      let name = this.$stepTypeName.val().trim()
      if (name.length == 0) {
        alert("The name should contain more characters...")
        return
      }
      let index = parseInt(this.$stepTypeIndex.val())
      this.registerStepType(name, index)
    })
  }

  private registerStepType(name: string, index: number) {
    let o: any = {
      name
    }
    if (index !== NaN)
      o.orderNum = index

    let $indicator = this.$submitButton.find("span").show()
    createStepType(o).then(stepModel => {
      alert("Step type successfully created...")
      $indicator.hide()
    }).catch(err => {
      alert("Impossible to save the new step type...")
      $indicator.hide()
    })
  }
}