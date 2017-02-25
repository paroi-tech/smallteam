import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Box } from "../Boxlist/Boxlist"
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
   */
  constructor(private dash: Dash<App>, private stepType: StepTypeModel, idProperty?: string) {
    this.$container = $(template)
    if (idProperty)
      this.id = this.stepType[idProperty]
    else
      this.id = this.stepType.id
    this.$container.find(".js-span").text(this.stepType.name)
    this.$container.click(ev => {
      this.dash.emit("stepTypeBoxSelected", this.stepType )
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