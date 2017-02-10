import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Box } from "../Boxlist/Boxlist"

const template = require("html-loader!./taskbox.html")

export default class TaskBox implements Box {
  private $container: JQuery
  public readonly id: string

  constructor(private dash: Dash<App>, id: string, title: string) {
    this.$container = $(template)
    this.id = id
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