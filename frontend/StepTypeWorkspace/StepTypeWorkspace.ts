import * as $ from "jquery"
import App from "../App/App"
import { Dash, Bkb } from "bkb"
import { Workspace, ViewerController } from "../WorkspaceViewer/WorkspaceViewer"
import StepTypeForm from "../StepTypeForm/StepTypeForm"
import StepTypeBox from "../StepTypeBox/StepTypeBox"
import BoxList, { Box, BoxListParams, BoxEvent, BoxListEvent } from "../BoxList/BoxList"
import { Model, StepTypeModel } from "../AppModel/AppModel"
import { equal } from "../libraries/utils"

const template = require("html-loader!./steptypeworkspace.html")

/**
 * StepType management panel.
 *
 * It contains a form to create new StepTypes and a Boxlist that enables to select and reorder the StepTypes.
 * When the user reorders the content of the Boxlist, changes are commited after a timeout of 2s.
 */
export default class StepTypeWorkspace implements Workspace {
  readonly el: HTMLElement

  private $boxListContainer: JQuery
  private $formContainer: JQuery
  private $addBtn: JQuery
  private $input: JQuery

  private boxList: BoxList<StepTypeBox>
  private form: StepTypeForm

  private model: Model

  /**
   * Timer used to schedule the commit of the changes in the BoxList to the model.
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
    this.model = this.dash.app.model
    this.timer = undefined
    this.el = this.createHtmlElements().get(0)
    this.createChildComponents()
    this.loadStepTypes()
    this.listenToChildComponents()
    this.listenToModel()
  }

  /**
   * Listen to events from subcomponents.
   * The following events are handled:
   *  - StepTypeBox selection
   */
  private listenToChildComponents() {
    this.dash.listenToChildren<StepTypeModel>("stepTypeBoxSelected").call("dataFirst", stepType => {
      this.form.setStepType(stepType)
    })
  }

  /**
   * Listen to events from model.
   * Handled events are:
   *  - StepType creation
   *  - StepType deletion
   */
  private listenToModel() {
    // StepType creation.
    this.model.on("createStepType", "dataFirst", data => {
      let stepType = data.model as StepTypeModel
      let box = this.dash.create(StepTypeBox, { args: [ stepType ] })
      this.boxList.addBox(box)
      this.form.setStepType(stepType)
    })
    // StepType deletion.
    this.model.on("change", "dataFirst", data => {
      if (data.cmd != "delete" || data.type != "StepType")
        return
      this.boxList.removeBox(data.id as string)
      if (this.form.currentStepType != undefined && this.form.currentStepType.id == data.id)
        this.form.clear()
    })
  }

  /**
   * Create StepTypePanel HTML elements from the template.
   */
  private createHtmlElements() {
    let $container = $(template)
    this.$boxListContainer = $container.find(".js-boxlist-container")
    this.$formContainer = $container.find(".js-edit-form-container")
    this.$addBtn = $container.find(".js-add-form-btn")
    this.$input = $container.find(".js-input")
    this.$input.keyup(ev => {
      if (ev.which === 13)
        this.$addBtn.trigger("click")
    })
    this.$addBtn.click(() => {
      this.onAdd()
    })
    return $container
  }

  /**
   * Initialize the BoxList and Form components of the panel.
   */
  private createChildComponents() {
    this.boxList = this.dash.create(BoxList, {
      args: [ { id: "", name: "Step types", group: undefined, sort: true } ]
    })
    this.dash.listenToChildren<BoxListEvent>("boxListSortingUpdated").call("dataFirst", data => {
      this.handleBoxlistUpdate(data)
    })
    this.$boxListContainer.append(this.boxList.el)

    this.form = this.dash.create(StepTypeForm, { args: [] })
    this.$formContainer.append(this.form.el)
  }

  /**
   * Handle click on the `Add` button.
   *
   * If the name typed by the user is valid, it then calls the `addStepType` method.
   */
  private onAdd() {
    let name = this.$input.val() as string
    name = name.trim()
    if (name.length > 0) {
      this.addStepType(name)
    } else {
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
  private handleBoxlistUpdate(ev: BoxListEvent) {
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
    this.boxList.disable(true)
    try {
      let idList = await this.dash.app.model.reorder("StepType", ids)
      if (equal(idList, ids))
        console.log("Step types order sucessfully updated.")
      else {
        console.error("Sorry. Server rejected new order of step types...", idList, ids)
        this.boxList.setBoxesOrder(idList)
      }
    } catch (err) {
      console.log("Sorry. Unable to save the new order of steps on server.", err)
    }
    this.boxList.enable(true)
    this.form.clear()
  }

  /**
   * Load step types from the database and fill the Boxlist with them.
   */
  private async loadStepTypes() {
    try {
      let stepTypes = this.dash.app.model.global.stepTypes
      if (stepTypes.length === 0) {
        console.log("No step types to load from server...")
        return
      }
      for (let stepType of stepTypes)
        if (!stepType.isSpecial)
          this.boxList.addBox(this.dash.create(StepTypeBox, { args: [ stepType ] }))
    } catch (err) {
      console.error("Unable to load step types from server...", err)
    }
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
      // The StepTypeComponent listens to change from the model. So the newly created StepType
      // will be automatically displayed in the BoxList.
      spinner.hide()
      this.$input.val("").focus()
    }).catch(err => {
      console.error("Unable to create new step type...")
      spinner.hide()
    })
  }

  public activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el)
  }

  public deactivate() {
  }
}
