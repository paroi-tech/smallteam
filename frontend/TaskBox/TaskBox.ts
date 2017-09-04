import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Box } from "../BoxList/BoxList"
import { Model, TaskModel } from "../Model/Model"

const template = require("html-loader!./taskbox.html")

/**
 * Component used to show basic information about a task of a project.
 *
 * A TaskBox emits (through the dash) a `taskBoxSelected` event when a user click on it.
 * The event provides the `TaskModel` that the box represents.
 */
export default class TaskBox implements Box {
  readonly el: HTMLElement
  private spanEl: HTMLElement

  public readonly id: string

  private model: Model

  /**
   * Create a new TaskBox.
   * @param dash - the current application dash
   * @param task - the task for which the box is created for
   * @param idProp - the property of TaskModel that the box sould use as ID (defaults to TaskModel.id)
   */
  constructor(private dash: Dash<App>, readonly task: TaskModel, idProp = "id") {
    this.id = this.task[idProp].toString()
    this.model = this.dash.app.model
    let $container = $(template)
    this.spanEl = $container.find(".js-span").text(task.label).get(0)
    this.listenToModel()
    $container.click(() => {
      this.dash.emit("taskBoxSelected", this.task)
    })
    this.el = $container.get(0)
  }

  /**
   * Listen to events from model.
   * The following events are handled:
   *  - Task update
   */
  private listenToModel() {
    // Task update.
    this.model.on("change", "dataFirst", data => {
      if (data.type != "Task" || data.cmd != "update")
        return
      let task = data.model as TaskModel
      if (task.id === this.task.id)
        this.spanEl.textContent = task.label
    })
  }

  /**
   * Add or remove focus from the TaskBox.
   */
  public setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }
}
