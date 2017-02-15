import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Box } from "../Boxlist/Boxlist"
import { TaskModel } from "../Model/Model"

const template = require("html-loader!./taskbox.html")

export default class TaskBox implements Box {
  private $container: JQuery
  public readonly id: string

  constructor(private dash: Dash<App>, private task: TaskModel) {
    this.id = this.task.id

    this.$container = $(template)
    this.$container.find(".js-span").text(task.label)
    this.$container.click(() => {
      this.dash.emit("taskBoxSelected", {
        task: this.task
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