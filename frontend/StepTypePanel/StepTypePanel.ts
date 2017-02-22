import * as $ from "jquery"
import App from "../App/App"
import { Dash, Bkb } from "bkb"
import { Panel } from "../PanelSelector/PanelSelector"
import StepTypeForm from "../StepTypeForm/StepTypeForm"
import StepTypeBox from "../StepTypeBox/StepTypeBox"
import Boxlist, { Box, BoxlistParams, BoxEvent, BoxlistEvent } from "../Boxlist/Boxlist"
import { Model, StepTypeModel } from "../Model/Model"
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
      this.form.fillWith(stepType)
    })
  }

  /**
   * Create JQuery objects from the component template.
   *
   * Also add an event handler for click on `Add` button.
   */
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

  /**
   * Initialize the Boxlist and Form components of the panel.
   */
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

  /**
   * Handle click on the `Add` button.
   *
   * If the name typed by the user is valid, it then calls the `addStepType` method.
   */
  private doAdd() {
    let name = this.$input.val().trim()
    if (name.length > 0)
      this.addStepType(name)
    else {
      console.log("The name you entered for the step type is invalid.")
      this.$input.focus()
    }
  }

  /**
   * Schedule the update of step types order.
   *
   * A timeout of 2s is used to schedule the update. The timer is restarted if the user
   * reorders the step types within the 2s.
   */
  private handleBoxlistUpdate(ev: BoxlistEvent) {
    if (this.timer)
        clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.doUpdate(ev.boxIds)
    }, 2000)
  }

  /**
   * Save the new order of the step types in the model.
   *
   * If the changes are not accepted by the server, then it rollback them in the boxlist.
   *
   * @param ids - array of strings that contains the ids of step types
   */
  private async doUpdate(ids: string[]): Promise<void> {
    console.log(`Requesting updating of step types orders...`)
    try {
      let idList = await this.dash.app.model.reorder("StepType", ids)
      if (equal(idList, ids))
        console.log("Step types order sucessfully updated.")
      else {
        console.error("Sorry. Server rejected new order of step types...", idList, ids)
        this.boxlist.setBoxesOrder(idList)
      }
    } catch(err) {
      console.log("Sorry. Unable to save the new order of steps on server.", err)
    }
  }

  /**
   * Load step types from the database and fill the Boxlist with them.
   */
  private loadStepTypes() {
    this.dash.app.model.query("StepType").then(stepTypes => {
      this.stepTypes = stepTypes
      if (stepTypes.length === 0) {
        console.log("No step types to load from server...")
        return
      }
      for (let stepType of stepTypes)
        if (!stepType.isSpecial)
          this.boxlist.addBox(this.dash.create(StepTypeBox, { args: [ stepType ] } ))
    })
    .catch(err => {
      console.error("Unable to load step types from server...")
    })
  }

  /**
   * Save a new step type into the model and it to the Boxlist.
   *
   * @param name - the name of the new step type
   */
  private addStepType(name: string) {
    let spinner = this.$addBtn.find("span").show()
    this.dash.app.model.exec("create", "StepType", {
      name
    }).then(stepType => {
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

   /**
   * Add the panel as a child of an HTML element.
   *
   * @param el - element that the box will be added to.
   */
  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  /**
   * Hide the panel.
   */
  public hide() {
    this.$container.hide();
  }

  /**
   * Make the panel visible.
   */
  public show() {
    this.$container.show();
  }
}