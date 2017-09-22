import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Box } from "../BoxList/BoxList"
import { StepTypeModel } from "../AppModel/AppModel"

const template = require("html-loader!./steptypebox.html")

/**
 * Component used to show basic information about a StepType object.
 *
 * A StepTypeBox emits (through the dash) a `stepTypeBoxSelected` event when a user click on it.
 * The event provides the `StepType` that the box represents.
 */
export default class StepTypeBox implements Box {
  readonly el: HTMLElement

  public readonly id: string

  /**
   * Create a new StepTypeBox.
   *
   * @param dash - the current application dash
   * @param stepType - the StepType for which the box is created for.
   * @param idProp - the property of StepTypeModel that the box sould use as ID (defaults to id)
   */
  constructor(private dash: Dash<App>, readonly stepType: StepTypeModel, idProp = "id") {
    let $container = $(template)
    this.id = this.stepType[idProp]
    $container.find(".js-span").text(this.stepType.name)
    $container.click(ev => {
      this.dash.emit("stepTypeBoxSelected", this.stepType)
    })
    // We listen to the model and update the label of this StepTypeBox if the name of the StepType
    // is updated.
    this.dash.app.model.on("update", "dataFirst", data => {
      if (data.type === "StepType" && (data.model as StepTypeModel) == this.stepType)
        $container.find(".js-span").text(this.stepType.name)
    })
    this.el = $container.get(0)
  }

  /**
   * Add or remove focus from the box.
   */
  public setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }
}
