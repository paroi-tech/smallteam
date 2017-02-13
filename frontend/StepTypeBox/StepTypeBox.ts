import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Box } from "../Boxlist/Boxlist"
import { StepTypeModel } from "../Model/Model"

const template = require("html-loader!./steptypebox.html")

export default class StepTypeBox implements Box {
  private $container: JQuery
  public readonly id: string

  constructor(private dash: Dash<App>, private model: StepTypeModel) {
    this.$container = $(template)
    this.id = this.model.id
    this.$container.find(".js-span").text(this.model.name)
    this.$container.click(ev => {
      this.dash.emit("stepTypeBoxSelected", {
        boxId: this.id
      })
    })
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public setWithFocus(focus: boolean) {
    if (focus) {
      this.$container.addClass("focus")
    } else {
      this.$container.removeClass("focus")
    }
  }
}