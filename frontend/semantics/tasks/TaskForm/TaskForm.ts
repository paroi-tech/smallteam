import { Dash } from "bkb"
import * as MonkBerry from "monkberry"
import TaskCommentEditor from "../TaskCommentEditor/TaskCommentEditor"
import { TaskModel, Model, UpdateModelEvent } from "../../../AppModel/AppModel";
import FlagSelector from "../../flags/FlagSelector/FlagSelector";
import ContributorSelector from "../../contributors/ContributorSelector/ContributorSelector";
import App from "../../../App/App";

const template = require("./TaskForm.monk")

/**
 * Component used to display and edit information about a task.
 */
export default class TaskForm {
  readonly el: HTMLElement

  private labelEl: HTMLInputElement
  private descriptionEl: HTMLTextAreaElement
  private submitSpinnerEl: HTMLElement
  private deleteSpinnerEl: HTMLElement
  private flagContainerEl: HTMLElement
  private commentContainerEl: HTMLElement
  private contributorContainerEl: HTMLElement

  private view: MonkberryView
  private task: TaskModel | undefined = undefined
  private model: Model

  private commentEditor: TaskCommentEditor
  private flagSelector: FlagSelector
  private contributorSelector: ContributorSelector

  /**
   * Create a new TaskForm.
   */
  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createHtmlElements()

    this.flagSelector = this.dash.create(FlagSelector)
    this.flagContainerEl.appendChild(this.flagSelector.el)

    this.contributorSelector = this.dash.create(ContributorSelector)
    this.contributorContainerEl.appendChild(this.contributorSelector.el)

    this.commentEditor = this.dash.create(TaskCommentEditor)
    this.commentContainerEl.appendChild(this.commentEditor.el)

    this.listenToModel()
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
    this.flagContainerEl = el.querySelector(".js-fselector-container") as HTMLElement
    this.contributorContainerEl = el.querySelector(".js-cselector-container") as HTMLElement
    this.commentContainerEl = el.querySelector(".js-comment-container") as HTMLElement

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
      if (this.task && this.task.id === data.id) {
        let state = {
          description: this.task.description || "",
          label: this.task.label
        }
        this.view.update(state)
      }
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
    this.contributorSelector.setTask(task)
    this.commentEditor.setTask(task)
  }

  private async deleteTask() {
    if (!this.task || (this.task.children || []).length > 0)
      return
    if (!confirm("Do you really want to remove this task?"))
      return
    try {
      await this.model.exec("delete", "Task", { id: this.task.id})
      // IMPORTANT: We listen to deleteTask event from the model. So the form will
      // be updated when the current task is deleted.
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
        description: this.descriptionEl.value.trim() || "",
        flagIds: this.flagSelector.selectedFlagIds,
        affectedToIds: this.contributorSelector.selectedContributorIds
      })
    } catch(err) {
      this.labelEl.value = this.task.label
      this.descriptionEl.value = this.task.description || ""
      this.flagSelector.refreshFlags()
      this.contributorSelector.refresh()
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
    this.contributorSelector.setTask(undefined)
    this.commentEditor.setTask(undefined)
  }
}
