import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Workspace } from "../WorkspaceViewer/WorkspaceViewer"
import { Model, TaskModel } from "../AppModel/AppModel"
import TaskFlagSelector from "../TaskFlagSelector/TaskFlagSelector"
import * as MonkBerry from "monkberry"

import * as template  from "./taskform.monk"
import { UpdateModelEvent } from "../AppModel/ModelEngine"

/**
 * Component used to display and edit information about a task.
 */
export default class TaskForm {
  readonly el: HTMLElement

  private labelEl: HTMLInputElement
  private descriptionEl: HTMLTextAreaElement
  private submitSpinnerEl: HTMLElement
  private deleteSpinnerEl: HTMLElement
  private flagSelectorContainerEl: HTMLElement

  private view: MonkberryView
  private task: TaskModel | undefined = undefined
  private model: Model

  private flagSelector: TaskFlagSelector

  /**
   * Create a new TaskForm.
   */
  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createHtmlElements()
    this.flagSelector = this.dash.create(TaskFlagSelector)
    this.flagSelectorContainerEl.appendChild(this.flagSelector.el)
  }

  /**
   * Create element content from template.
   */
  private createHtmlElements() {
    this.view = MonkBerry.render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLDivElement

    this.labelEl = el.querySelector(".js-task-label") as HTMLInputElement
    this.descriptionEl = el.querySelector(".js-task-description") as HTMLTextAreaElement
    this.submitSpinnerEl = el.querySelector(".js-submit-spinner") as HTMLElement
    this.deleteSpinnerEl = el.querySelector(".js-delete-spinner") as HTMLElement
    this.flagSelectorContainerEl = el.querySelector(".js-fselector-container") as HTMLElement

    let submitBtn = el.querySelector(".js-submit-button") as HTMLButtonElement
    submitBtn.addEventListener("click", ev => this.updateTask())

    let showPanelBtn = el.querySelector(".js-btn-panel") as HTMLButtonElement
    showPanelBtn.addEventListener("click", ev => {
      if (this.task)
        this.dash.emit("showStepSwitcher", this.task)
    })

    let deleteBtn = el.querySelector(".js-btn-delete") as HTMLButtonElement
    deleteBtn.addEventListener("click", ev => {
      if (this.task)
        this.deleteTask()
    })

    return el
  }

  /**
   * Listen to events from model.
   * Handled events are:
   *  - Task deletion
   */
  private listenToModel() {
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteTask").onData(data => {
      if (this.task !== undefined && this.task.id === data.id)
        this.clear()
    })
    this.dash.listenTo<UpdateModelEvent>(this.model, "updateTask").onData(data => {
      if (this.task && this.task.id === data.id)
        this.setTask(data.model) // Refresh the form, lazy way :)
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
    this.flagSelector.setTask(task)
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
    this.flagSelector.setTask(undefined)
  }
}
