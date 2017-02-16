import * as $ from "jquery"
import App from "../App/App"
import { Dash, Bkb } from "bkb"
import { Panel } from "../PanelSelector/PanelSelector"
import StepTypeForm from "../StepTypeForm/StepTypeForm"
import StepTypeBox from "../StepTypeBox/StepTypeBox"
import Boxlist, { Box, BoxlistParams, BoxEvent, BoxlistEvent } from "../Boxlist/Boxlist"
import Model, { StepTypeModel } from "../Model/Model"
import { updateStepTypeOrders } from "../Model/fakeModel"
import { equal } from "../libraries/utils"

const template = require("html-loader!./steptypepanel.html")

/**
 * StepType management panel.
 *
 * It contains a form to create new StepTypes and a Boxlist that enables to select and reorder the StepTypes.
 * When the user reorders the content of the Boxlist, changes are commited after a timeout of 2s.
 */
export default class StepTypePanel {
  private $container: JQuery
  private $boxlistContainer: JQuery
  private $formContainer: JQuery
  private $addBtn: JQuery
  private $input: JQuery

  private boxlist: Boxlist<StepTypeBox>
  private form: StepTypeForm

  private stepTypes: Array<StepTypeModel>

  /**
   * Timer used to schedule the commit of the changes in the Boxlist to the model.
   */
  private timer: any

  /**
   * Create a new StepTypePanel.
   *
   * It loads StepTypes from the model.
   *
   * @param dash - the current application dash
   */
  constructor(private dash: Dash<App>) {
    this.timer = undefined

    this.initJQueryObjects()
    this.initComponents()
    this.loadStepTypes()

    this.dash.listenToChildren<StepTypeModel>("stepTypeBoxSelected").call("dataFirst", stepType => {
      this.form.reset()
      this.form.fillWith(stepType)
    })
  }

  private initJQueryObjects() {
    this.$container = $(template)
    this.$boxlistContainer = this.$container.find(".js-boxlist-container")
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
  }

  private doAdd() {
    let name = this.$input.val().trim()
    if (name.length > 0)
      this.saveStepType(name)
    else {
      alert("The name you entered for the step type is invalid.")
      this.$input.focus()
    }
  }

  private initComponents() {
    this.boxlist = this.dash.create(Boxlist, {
      args: [ { id: "", name: "Step types" } ]
    })
    this.dash.listenToChildren<BoxlistEvent>("boxlistSortingUpdated").call("dataFirst", data => {
      this.handleBoxlistUpdate(data)
    })
    this.boxlist.attachTo(this.$boxlistContainer[0])

    this.form = this.dash.create(StepTypeForm, { args: [] })
    this.form.attachTo(this.$formContainer[0])
  }

  private handleBoxlistUpdate(ev: BoxlistEvent) {
    if (this.timer)
        clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.doUpdate(ev.boxIds)
    }, 2000)
  }

  private doUpdate(ids: Array<string>) {
    console.log(`Requesting updating of step types orders...`)
    updateStepTypeOrders(ids).then(response => {
      if (equal(response, ids))
        console.log("Step types order sucessfully updated.")
      else {
        console.error("Sorry. Server rejected new order of step types...")
        this.boxlist.setBoxesOrder(response)
      }
    }).catch(err => {
      alert("Sorry. Unable to save the new order of steps on server.")
    })
  }

  private loadStepTypes() {
    this.dash.app.model.query("StepType").then(stepTypes => {
      this.stepTypes = stepTypes
      if (stepTypes.length === 0) {
        console.log("No step types to load from server...")
        return
      }
      for (let stepType of stepTypes)
        this.boxlist.addBox(this.dash.create(StepTypeBox, { args: [ stepType ] } ))
    })
    .catch(err => {
      alert("Unable to load step types from server...")
    })
  }

  private saveStepType(name: string) {
    let spinner = this.$addBtn.find("span").show()
    this.dash.app.model.exec("create", "StepType", {
      name
    }).then(stepType => {
      // FIXME: stepTypes can be undefined at this point
      if (!this.stepTypes)
        this.loadStepTypes()
      else {
        let box = this.dash.create(StepTypeBox, {
          args: [ stepType ]
        })
        this.boxlist.addBox(box)
        spinner.hide()
      }
    }).catch(err => {
      console.error("Unable to create new step type...")
      spinner.hide()
    })
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public hide() {
    this.$container.hide();
  }

  public show() {
    this.$container.show();
  }
}