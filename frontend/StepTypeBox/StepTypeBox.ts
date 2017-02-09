import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Box } from "../BoxList/BoxList"

const template = require("html-loader!./steptypebox.html")

export default class StepTypeBox implements Box {
  private $container: JQuery

  constructor(private dash: Dash<App>, title: string) {
    this.$container = $(template)
    this.$container.find(".js-span").text(title)
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