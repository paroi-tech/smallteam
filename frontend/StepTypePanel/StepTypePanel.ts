import * as $ from "jquery"
import App from "../App/App"
import { Dash, Bkb } from "bkb"
import { Panel } from "../PanelSelector/PanelSelector"
import StepTypeForm from "../StepTypeForm/StepTypeForm"
import StepTypeBox from "../StepTypeBox/StepTypeBox"
import { Box, Boxlist, BoxlistParams } from "../Boxlist/Boxlist"
import { query, exec, StepTypeModel } from "../Model/Model"
import { UpdateStepTypeOrders } from "../Model/fakeModel"
import { equal } from "../libraries/utils"

const template = require("html-loader!./steptypepanel.html")

export default class StepTypePanel {
  private $container: JQuery
  private $listContainer: JQuery
  private $formContainer: JQuery
  private $addBtn: JQuery
  private $input: JQuery

  private boxlist: Boxlist
  private form: StepTypeForm

  private stepTypes: Array<StepTypeModel>
  private timer: any

  constructor(private dash: Dash<App>) {
    this.stepTypes = []
    this.timer = null

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

    this.dash.listenToChildren("stepTypeBoxSelected").call("dataFirst", (data: any) => {
      this.form.reset()
      let step = this.stepTypes.find((t: StepTypeModel): boolean => {
        return t.id === data.boxId
      })
      if (step)
        this.form.fillWith(step)
    })
  }

  private doAdd() {
    let name = this.$input.val().trim()
    if (name.length > 0) {
      this.saveStepType(name)
    } else {
      alert("The name you entered for the step type is invalid.")
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
    let params: BoxlistParams = {
      id: null,
      name: "Step types"
    }
    this.boxlist = this.dash.create(Boxlist, { args: [ params ] })
    this.boxlist.attachTo(this.$listContainer[0])
    this.dash.listenToChildren("boxlistUpdated").call("dataFirst", (data: any) => {
      if (this.timer)
        clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        console.log(`Requesting updating of step types orders...`)
        UpdateStepTypeOrders(data.boxIds).then(response => {
          if (equal(response, data.boxIds)) {
            alert("Step types order sucessfully updated.")
          } else {
            alert("Sorry. Server rejected new order of step types...")
            this.boxlist.setBoxesOrder(data.boxIds)
          }
        }).catch(err => {
          alert("Sorry. Unable to save the new order of steps on server.")
        })
      }, 2000)
    })

    this.form = this.dash.create(StepTypeForm, {
      args: []
    })
    this.form.attachTo(this.$formContainer[0])
  }

  private loadStepTypes() {
    query("StepType").then(stepTypes => {
      if (stepTypes.length === 0) {
        alert("No step types to load from server.")
        return
      }

      this.stepTypes = stepTypes
      for (let model of stepTypes) {
        let box = this.dash.create(StepTypeBox, {
          args: [ model ]
        })
        this.boxlist.addBox(box)
      }
    }).catch(err => {
      alert("Unable to load step types from server...")
    })
  }

  private saveStepType(name: string) {
    let spinner = this.$addBtn.find("span").show()
    exec("create", "StepType", {
      name
    }).then(model => {
      this.stepTypes.push(model)
      let box = this.dash.create(StepTypeBox, {
        args: [ model ]
      })
      this.boxlist.addBox(box)
      alert("Step type successfully created.")
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
