import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"
import { Model, TaskModel } from "../Model/Model"
import * as MonkBerry from "monkberry"

import * as template  from "./taskpanel.monk"

/**
 * Component used to display and edit information about a task.
 */
export default class TaskPanel implements Panel {
  private container: HTMLElement
  private spinner: HTMLElement

  private view: MonkberryView
  private task: TaskModel | undefined = undefined
  private model: Model

  /**
   * Create a new TaskPanel.
   *
   * @param dash
   * @param title
   */
  constructor(private dash: Dash<App>, title: string) {
    this.model = this.dash.app.model

    this.container = document.createElement("div")
    this.container.classList.add("TaskPanel")
    this.view = MonkBerry.render(template, this.container)
    this.spinner = this.view.querySelector(".js-spinner")

    let btn = this.container.querySelector(".js-submit-button") as HTMLButtonElement
    if (btn) {
      btn.onclick = (ev) => this.updateTask()
    }
  }

  /**
   * Listen to events from model.
   * Handled events are:
   *  - Task deletion
   */
  private listenToModel() {
    this.model.on("change", "dataFirst", data => {
      if (data.type != "Task" || data.cmd != "delete")
        return
      if (this.task != undefined && this.task.id == data.id)
        this.reset()
    })
  }

  /**
   * Add the TaskPanel as a child of an HTML element.
   *
   * @param el - element that the TaskPanel will be added to.
   */
  public attachTo(el: HTMLElement) {
    el.appendChild(this.container)
  }

  /**
   * Set the task that the TaskPanel will display.
   *
   * @param task
   */
  public fillWith(task: TaskModel) {
    this.task = task
    this.view.update({
      description: task.description || "",
      label: task.label
    })
  }

  /**
   * Update the current task in the model.
   */
  private async updateTask() {
    if (!this.task)
      return
    let label = this.container.querySelector(".js-task-label") as HTMLInputElement
    let description = this.container.querySelector(".js-task-description") as HTMLTextAreaElement
    if (!label || label.value.trim().length < 4 || !description)
      return
    this.spinner.style.display = "inline"
    try {
      let task = await this.model.exec("update", "Task", {
        id: this.task.id,
        label: label.value.trim(),
        description: description.value.trim() || ""
      })
    } catch(err) {
      label.value = this.task.label
      description.value = this.task.description || ""
      console.error(`Error while updating task ${this.task!}: ${err}`)
    }
    this.spinner.style.display = "none"
  }

  /**
   * Return the TaskModel the panel is currently working on.
   */
  get currentTask(): TaskModel | undefined {
    return this.task
  }

  /**
   * Hide the TaskPanel.
   */
  public hide() {
    this.container.style.display = "none"
  }

  /**
   * Make the TaskPanel visible.
   */
  public show() {
    this.container.style.display = "block"
  }

  /**
   * Reset the fields in the panel and set `currentTask` to `undefined`.
   */
  public reset() {
    this.task = undefined
    this.view.update({
      description: "",
      label: ""
    })
  }
}
