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
  readonly el: HTMLElement

  private spinner: HTMLElement

  private view: MonkberryView
  private task: TaskModel | undefined = undefined
  private model: Model

  /**
   * Create a new TaskPanel.
   */
  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createDom()
  }

  private createDom() {
    let container = document.createElement("div")
    container.classList.add("TaskPanel")
    this.view = MonkBerry.render(template, container)
    this.spinner = this.view.querySelector(".js-spinner")

    let submitBtn = container.querySelector(".js-submit-button") as HTMLButtonElement
    if (submitBtn)
      submitBtn.addEventListener("click", ev => this.updateTask())

    let showPanelBtn = container.querySelector(".js-show-stepspanel-button") as HTMLButtonElement
    if (showPanelBtn) {
      showPanelBtn.addEventListener("click", ev => {
        if (this.task)
          this.dash.emit("showStepsPanel", this.task)
      })
    }
    return container
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
    let label = this.el.querySelector(".js-task-label") as HTMLInputElement // FIXME: Use instance variable
    let description = this.el.querySelector(".js-task-description") as HTMLTextAreaElement // FIXME: Use instance variable
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
    this.el.style.display = "none"
  }

  /**
   * Make the TaskPanel visible.
   */
  public show() {
    this.el.style.display = "block"
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
