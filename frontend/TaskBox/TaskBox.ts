import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Box } from "../BoxList/BoxList"
import { TaskModel } from "../Model/Model"

const template = require("html-loader!./taskbox.html")

/**
 * Component used to show basic information about a task of a project.
 *
 * A TaskBox emits (through the dash) a `taskBoxSelected` event when a user click on it.
 * The event provides the `TaskModel` that the box represents.
 */
export default class TaskBox implements Box {
  private $container: JQuery
  public readonly id: string

  /**
   * Create a new TaskBox.
   * @param dash - the current application dash
   * @param task - the task for which the box is created for.
   */
  constructor(private dash: Dash<App>, private task: TaskModel) {
    this.id = this.task.id
    this.$container = $(template)
    this.$container.find(".js-span").text(task.label)
    this.$container.click(() => {
      this.dash.emit("taskBoxSelected", this.task)
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
   * Add or remove focus from the TaskBox.
   */
  public setWithFocus(focus: boolean) {
    if (focus) {
      this.$container.addClass("focus")
    } else {
      this.$container.removeClass("focus")
    }
  }
}