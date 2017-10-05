import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Box } from "../BoxList/BoxList"
import TaskFlagComponent from "../TaskFlagComponent/TaskFlagComponent"
import { Model, TaskModel } from "../AppModel/AppModel"
import { UpdateModelEvent } from "../AppModel/ModelEngine"
import { render } from "monkberry"

import * as template from "./taskbox.monk"

/**
 * Component used to show basic information about a task of a project.
 *
 * A TaskBox emits (through the dash) a `taskBoxSelected` event when a user click on it.
 * The event provides the `TaskModel` that the box represents.
 */
export default class TaskBox implements Box {
  readonly el: HTMLElement
  readonly id: string

  private spanEl: HTMLElement
  private flagContainerLeftEl: HTMLElement

  private view: MonkberryView

  private model: Model

  /**
   * Create a new TaskBox.
   * @param dash - the current application dash
   * @param task - the task for which the box is created for
   */
  constructor(private dash: Dash<App>, readonly task: TaskModel) {
    this.id = this.task.id
    this.model = this.dash.app.model

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement

    this.spanEl = this.el.querySelector(".js-span") as HTMLElement
    this.spanEl.textContent = this.task.label

    this.flagContainerLeftEl = this.el.querySelector(".js-container-left") as HTMLElement

    this.addFlags()
    this.listenToModel()
    this.el.addEventListener("click", ev => this.dash.emit("taskBoxSelected", this.task))
  }

  private addFlags() {
    if (!this.task.flagIds)
      return

    for (let flagId of this.task.flagIds) {
      let flag = this.model.global.flags.get(flagId)
      if (flag) {
        let flagComp = this.dash.create(TaskFlagComponent, flag)
        this.flagContainerLeftEl.appendChild(flagComp.el)
      }
    }
  }

  private listenToModel() {
    // Task update.
    this.dash.listenTo<UpdateModelEvent>(this.model, "updateTask").onData(data => {
      let task = data.model as TaskModel
      if (task.id === this.task.id)
        this.spanEl.textContent = task.label
    })

    // Flag added to Task.
    this.dash.listenTo<UpdateModelEvent>(this.model, "createTaskFlag").onData(data => {
      // TODO: Implement this.
    })

    // Flag removed from Task.
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteTaskFlag").onData(data => {
      // TODO: Implement this.
    })
  }

  public setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }
}
