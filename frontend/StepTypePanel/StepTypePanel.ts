import * as $ from "jquery"
import App from "../App/App"
import { Dash, Bkb } from "bkb"
import { Panel } from "../PanelSelector/PanelSelector"
import StepTypeForm from "../StepTypeForm/StepTypeForm"
import StepTypeBox from "../StepTypeBox/StepTypeBox"
import { Box, BoxList } from "../BoxList/BoxList"
import { queryStepTypes, createStepType } from "../Model/Model"

const template = require("html-loader!./steptypepanel.html")

export default class StepTypePanel {
  private $container: JQuery
  private $listContainer: JQuery
  private $formContainer: JQuery
  private $addBtn: JQuery

  private list: BoxList
  private form: StepTypeForm

  constructor(private dash: Dash<App>) {
    this.$container = $(template)
    this.$listContainer = this.$container.find(".js-boxlist-container")
    this.$formContainer = this.$container.find(".js-edit-form-container")
    this.$addBtn = this.$container.find(".js-add-form-btn")

    let $input = this.$container.find(".js-input")
    this.$addBtn.click(ev => {
      let name = $input.val().trim()
      if (name.length > 0) {
        this.saveStepType(name)
      } else {
        alert("The name you type for the step type is invalid.")
        $input.focus()
      }
    })

    this.initComponents()
    this.loadStepTypes()
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public hide() {
    this.$container.hide();
  }

  private initComponents() {
    this.list = this.dash.create(BoxList, {
      args: [
        "Step types",
      ]
    })
    this.list.attachTo(this.$listContainer[0])

    this.form = this.dash.create(StepTypeForm, {
      args: []
    })
    this.form.attachTo(this.$formContainer[0])
  }

  private loadStepTypes() {
    queryStepTypes().then(stepTypes => {
      for (let t of stepTypes) {
        console.log("loaded step types: ", t)
        let b = this.dash.create(StepTypeBox, {
          args: [
            t.name
          ]
        })
        this.list.addBox(b)
      }
    }).catch(err => {
      alert("Unable to load step types from server...")
    })
  }

  private saveStepType(name: string) {
    let spinner = this.$addBtn.find("span").show()
    createStepType({
      name
    }).then(model => {
      let b = this.dash.create(StepTypeBox, {
        args: [
          model.name
        ]
      })
      alert("Step type successfully created.")
      this.list.addBox(b)
      spinner.hide()
    }).catch(err => {
      alert("Unable to create nex step type...")
      spinner.hide()
    })
  }

  public show() {
    this.$container.show();
  }

}
