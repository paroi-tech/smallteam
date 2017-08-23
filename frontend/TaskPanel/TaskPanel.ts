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

    let btn = this.container.querySelector(".js-submit-button") as HTMLButtonElement
    if (btn)
      btn.onclick = (ev) => this.updateTask()
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
    if (label && label.value.length > 0 && description) {
      try {
        let task = await this.model.exec("update", "Task", {
          id: this.task.id,
          label: label.value,
          description: description.value || ""
        })
        console.log("Task successfully updated...")
      } catch(err) {
        label.value = this.task.label
        description.value = this.task.description || ""
        console.error(`Error while updating task ${this.task!}: ${err}`)
      }
    }
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
}
