import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Workspace } from "../WorkspaceViewer/WorkspaceViewer"
import { Model, TaskModel } from "../AppModel/AppModel"
import * as MonkBerry from "monkberry"

import * as template  from "./taskform.monk"

/**
 * Component used to display and edit information about a task.
 */
export default class TaskForm implements Workspace {
  readonly el: HTMLElement

  private labelEl: HTMLInputElement
  private descriptionEl: HTMLTextAreaElement
  private submitSpinnerEl: HTMLElement
  private deleteSpinnerEl: HTMLElement

  private view: MonkberryView
  private task: TaskModel | undefined = undefined
  private model: Model

  /**
   * Create a new TaskForm.
   */
  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createHtmlElements()
  }

  /**
   * Create element content from template.
   */
  private createHtmlElements() {
    let container = document.createElement("div")
    container.classList.add("TaskForm")

    this.view = MonkBerry.render(template, container)
    this.labelEl = this.view.querySelector(".js-task-label") as HTMLInputElement
    this.descriptionEl = this.view.querySelector(".js-task-description") as HTMLTextAreaElement
    this.submitSpinnerEl = this.view.querySelector(".js-submit-spinner")
    this.deleteSpinnerEl = this.view.querySelector(".js-delete-spinner")

    let submitBtn = this.view.querySelector(".js-submit-button") as HTMLButtonElement
    submitBtn.addEventListener("click", ev => this.updateTask())

    let showPanelBtn = this.view.querySelector(".js-btn-panel") as HTMLButtonElement
    showPanelBtn.addEventListener("click", ev => {
      if (this.task)
        this.dash.emit("showStepSwitcher", this.task)
    })

    let deleteBtn = this.view.querySelector(".js-btn-delete") as HTMLButtonElement
    deleteBtn.addEventListener("click", ev => {
      if (this.task)
        this.deleteTask()
    })

    return container
  }

  /**
   * Listen to events from model.
   * Handled events are:
   *  - Task deletion
   */
  private listenToModel() {
    this.model.on("change", "dataFirst", data => {
      if (data.type !== "Task" || data.cmd !== "delete")
        return
      if (this.task !== undefined && this.task.id === data.id)
        this.clear()
    })
    this.model.on("change", "dataFirst", data => {
      if (!this.task || data.type !== "Task" || data.cmd !== "update")
        return
      let task = data.model as TaskModel
      if (this.task.id === task.id)
        this.setTask(task) // Refresh the panel, lazy way :)
    })
  }

  /**
   * Set the task that the form will display.
   *
   * @param task
   */
  public setTask(task: TaskModel) {
    this.task = task
    this.view.update({
      description: task.description || "",
      label: task.label
    })
  }

  private async deleteTask() {
    if (!this.task || (this.task.children || []).length > 0)
      return
    if (!confirm("Do you really want to remove this task?"))
      return
    try {
      await this.model.exec("delete", "Task", { id: this.task.id})
    } catch (error) {
      console.log("Unable to delete task", error)
    }
  }

  /**
   * Update the current task in the model.
   */
  private async updateTask() {
    if (!this.task)
      return

    let label = this.labelEl.value.trim()
    if (label.length < 4)
      return

    this.submitSpinnerEl.style.display = "inline"
    try {
      await this.model.exec("update", "Task", {
        id: this.task.id,
        label: label.trim(),
        description: this.descriptionEl.value.trim() || ""
      })
    } catch(err) {
      this.labelEl.value = this.task.label
      this.descriptionEl.value = this.task.description || ""
      console.error(`Error while updating task ${this.task}: ${err}`)
    }
    this.submitSpinnerEl.style.display = "none"
  }

  /**
   * Return the TaskModel the panel is currently working on.
   */
  get currentTask(): TaskModel | undefined {
    return this.task
  }

  /**
   * Hide the TaskForm.
   */
  public hide() {
    this.el.style.display = "none"
  }

  /**
   * Make the TaskForm visible.
   */
  public show() {
    this.el.style.display = "block"
  }

  /**
   * Reset the fields in the panel and set `currentTask` to `undefined`.
   */
  public clear() {
    this.task = undefined
    this.view.update({
      description: "",
      label: ""
    })
  }
}
