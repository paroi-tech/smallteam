import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Box } from "../BoxList/BoxList"
import { StepTypeModel } from "../Model/Model"

const template = require("html-loader!./steptypebox.html")

/**
 * Component used to show basic information about a StepType object.
 *
 * A StepTypeBox emits (through the dash) a `stepTypeBoxSelected` event when a user click on it.
 * The event provides the `StepType` that the box represents.
 */
export default class StepTypeBox implements Box {
  private $container: JQuery
  public readonly id: string

  /**
   * Create a new StepTypeBox.
   *
   * @param dash - the current application dash
   * @param stepType - the StepType for which the box is created for.
   * @param idProp - the property of StepTypeModel that the box sould use as ID (defaults to id)
   */
  constructor(private dash: Dash<App>, readonly stepType: StepTypeModel, idProp = "id") {
    this.$container = $(template)
    this.id = this.stepType[idProp]
    this.$container.find(".js-span").text(this.stepType.name)
    this.$container.click(ev => {
      this.dash.emit("stepTypeBoxSelected", this.stepType)
    })
    // We listen to the model and update the label of this StepTypeBox if the name of the StepType
    // is updated.
    this.dash.app.model.on("update", "dataFirst", data => {
      if (data.type === "StepType" && (data.model as StepTypeModel) == this.stepType)
        this.$container.find(".js-span").text(this.stepType.name)
    })
  }

  /**
   * Add the box as a child of an HTML element.
   *
   * @param el - element that the box will be added to.
   */
  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  /**
   * Add or remove focus from the box.
   */
  public setWithFocus(focus: boolean) {
    if (focus) {
      this.$container.addClass("focus")
    } else {
      this.$container.removeClass("focus")
    }
  }
}
