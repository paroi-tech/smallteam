import * as $ from "jquery"
import App from "../App/App"
import { Dash, Bkb } from "bkb"
import { Panel } from "../PanelSelector/PanelSelector"
import StepTypeForm from "../StepTypeForm/StepTypeForm"
import StepTypeBox from "../StepTypeBox/StepTypeBox"
import { Box, Boxlist } from "../Boxlist/Boxlist"
import { queryStepTypes, createStepType } from "../Model/Model"
import { StepTypeModel } from "../Model/FragmentsModel"

const template = require("html-loader!./steptypepanel.html")

export default class StepTypePanel {
  private $container: JQuery
  private $listContainer: JQuery
  private $formContainer: JQuery
  private $addBtn: JQuery
  private $input: JQuery

  private list: Boxlist
  private form: StepTypeForm

  private stepTypes: Array<StepTypeModel>

  constructor(private dash: Dash<App>) {
    this.stepTypes = []
    this.$container = $(template)
    this.$listContainer = this.$container.find(".js-boxlist-container")
    this.$formContainer = this.$container.find(".js-edit-form-container")
    this.$addBtn = this.$container.find(".js-add-form-btn")
    this.$input = this.$container.find(".js-input")
    this.$input.keyup(ev => {
      if (ev.which === 13)
        this.$addBtn.trigger("click")
    })
    this.$addBtn.click(() => {
      this.doAdd()
    })

    this.initComponents()
    this.loadStepTypes()
  }

  private doAdd() {
    let name = this.$input.val().trim()
    if (name.length > 0) {
      this.saveStepType(name)
    } else {
      alert("The name you type for the step type is invalid.")
      this.$input.focus()
    }
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public hide() {
    this.$container.hide();
  }

  private initComponents() {
    this.list = this.dash.create(Boxlist, {
      args: [ null, "Step types" ]
    })
    this.list.attachTo(this.$listContainer[0])
    this.dash.listenToChildren("boxlistUpdated").call("arguments", (data: any) => {
      console.log(`reacting to event ${data.boxlistId}`)
    })

    this.form = this.dash.create(StepTypeForm, {
      args: []
    })
    this.form.attachTo(this.$formContainer[0])
  }

  private loadStepTypes() {
    queryStepTypes().then(stepTypes => {
      if (stepTypes.length === 0) {
        alert("No step types to load from server.")
        return
      }

      this.stepTypes = stepTypes
      for (let t of stepTypes) {
        let b = this.dash.create(StepTypeBox, {
          args: [ t.id, t.name ]
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
      this.stepTypes.push(model)
      let b = this.dash.create(StepTypeBox, {
        args: [
          model.name
        ]
      })
      alert("Step type successfully created.")
      this.list.addBox(b)
      spinner.hide()
    }).catch(err => {
      alert("Unable to create new step type...")
      spinner.hide()
    })
  }

  public show() {
    this.$container.show();
  }

}
