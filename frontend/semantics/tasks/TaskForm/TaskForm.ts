import { Dash, Log } from "bkb"
import * as MonkBerry from "monkberry"
import TaskCommentEditor from "../TaskCommentEditor/TaskCommentEditor"
import { TaskModel, Model, UpdateModelEvent } from "../../../AppModel/AppModel"
import FlagSelector from "../../flags/FlagSelector/FlagSelector"
import TaskLogDialog from "../TaskLogDialog/TaskLogDialog"
import ContributorSelector from "../../contributors/ContributorSelector/ContributorSelector"
import TaskAttachmentManager from "../TaskAttachmentManager/TaskAttachmentManager"
import App from "../../../App/App"
import InfoDialog from "../../../generics/ShortDialog/InfoDialog/InfoDialog"
import ErrorDialog from "../../../generics/ShortDialog/ErrorDialog/ErrorDialog"
import QuestionDialog from "../../../generics/ShortDialog/QuestionDialog/QuestionDialog"

const template = require("./TaskForm.monk")

export default class TaskForm {
  readonly el: HTMLElement
  private fieldsetEl: HTMLFieldSetElement
  private labelEl: HTMLInputElement
  private descriptionEl: HTMLTextAreaElement
  private submitSpinnerEl: HTMLElement
  private deleteSpinnerEl: HTMLElement
  private flagContainerEl: HTMLElement
  private commentContainerEl: HTMLElement
  private contributorContainerEl: HTMLElement
  private attachmentContainerEl: HTMLElement

  private view: MonkberryView

  private currentTask: TaskModel | undefined
  private model: Model
  private log: Log

  private commentEditor: TaskCommentEditor
  private flagSelector: FlagSelector
  private contributorSelector: ContributorSelector
  private logDialog: TaskLogDialog
  private attachmentMgr: TaskAttachmentManager

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log
    this.el = this.createView()
    this.createChildComponents()
    this.listenToModel()
  }

  public hide() {
    this.el.style.display = "none"
  }

  public show() {
    this.el.style.display = "block"
  }

  public reset() {
    this.currentTask = undefined
    this.view.update({
      description: "",
      label: ""
    })
    this.flagSelector.task = undefined
    this.contributorSelector.task = undefined
    this.commentEditor.task = undefined
    this.logDialog.task = undefined
    this.attachmentMgr.task = undefined
  }

  // --
  // -- Accessors
  // --

  get task(): TaskModel | undefined {
    return this.currentTask
  }

  set task(task: TaskModel | undefined) {
    if (!task) {
      this.reset()
      return
    }
    this.currentTask = task
    this.view.update({
      description: task.description || "",
      label: task.label
    })
    this.flagSelector.task = task
    this.contributorSelector.task = task
    this.commentEditor.task = task
    this.logDialog.task = task
    this.attachmentMgr.task = task
  }

  // --
  // -- Utilities
  // --

  private createView() {
    this.view = MonkBerry.render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLDivElement
    this.fieldsetEl = el.querySelector("fieldset") as HTMLFieldSetElement
    this.labelEl = el.querySelector(".js-task-label") as HTMLInputElement
    this.descriptionEl = el.querySelector(".js-task-description") as HTMLTextAreaElement
    this.submitSpinnerEl = el.querySelector(".js-submit-spinner") as HTMLElement
    this.deleteSpinnerEl = el.querySelector(".js-delete-spinner") as HTMLElement
    this.flagContainerEl = el.querySelector(".js-fselector-container") as HTMLElement
    this.contributorContainerEl = el.querySelector(".js-cselector-container") as HTMLElement
    this.commentContainerEl = el.querySelector(".js-comment-container") as HTMLElement
    this.attachmentContainerEl = el.querySelector(".js-attachment-container") as HTMLElement

    let submitBtn = el.querySelector(".js-submit-button") as HTMLButtonElement
    submitBtn.addEventListener("click", ev => this.updateTask())

    let showPanelBtn = el.querySelector(".js-btn-panel") as HTMLButtonElement
    showPanelBtn.addEventListener("click", ev => {
      if (this.currentTask)
        this.dash.emit("showStepSwitcher", this.currentTask)
    })

    let showLogBtn = el.querySelector(".js-btn-log") as HTMLButtonElement
    showLogBtn.addEventListener("click", ev => {
      if (this.currentTask)
        this.logDialog.show()
    })

    let deleteBtn = el.querySelector(".js-btn-delete") as HTMLButtonElement
    deleteBtn.addEventListener("click", ev => {
      if (this.currentTask)
        this.deleteTask()
    })

    let testBtn = el.querySelector(".js-test-button") as HTMLButtonElement
    testBtn.onclick = (ev) => {
      let d = this.dash.create(QuestionDialog)
      let p = d.show("My first information", "Hello")
      console.log("dialog opened")
      p.then(b => {
        console.log("fucking yeah")
      })
    }

    return el
  }

  private createChildComponents() {
    this.flagSelector = this.dash.create(FlagSelector)
    this.flagContainerEl.appendChild(this.flagSelector.el)

    this.contributorSelector = this.dash.create(ContributorSelector)
    this.contributorContainerEl.appendChild(this.contributorSelector.el)

    this.commentEditor = this.dash.create(TaskCommentEditor)
    this.commentContainerEl.appendChild(this.commentEditor.el)

    this.logDialog = this.dash.create(TaskLogDialog)

    this.attachmentMgr = this.dash.create(TaskAttachmentManager)
    this.attachmentContainerEl.appendChild(this.attachmentMgr.el)
  }

  private listenToModel() {
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteTask").onData(data => {
      if (this.currentTask !== undefined && this.currentTask.id === data.id)
        this.reset()
    })

    this.dash.listenTo<UpdateModelEvent>(this.model, "updateTask").onData(data => {
      if (this.currentTask && this.currentTask.id === data.id) {
        let state = {
          description: this.currentTask.description || "",
          label: this.currentTask.label
        }
        this.view.update(state)
      }
    })
  }

  private async deleteTask() {
    if (!this.currentTask || (this.currentTask.children || []).length > 0)
      return
    if (!confirm("Do you really want to remove this task?"))
      return
    try {
      await this.model.exec("delete", "Task", { id: this.currentTask.id })
      // IMPORTANT: We listen to deleteTask event from the model. So the form will
      // be updated when the current task is deleted.
    } catch (error) {
      this.log.info("Unable to delete task", error)
    }
  }

  private async updateTask() {
    if (!this.currentTask)
      return

    let label = this.labelEl.value.trim()
    if (label.length < 4)
      return

    this.showSpinner()
    try {
      await this.model.exec("update", "Task", {
        id: this.currentTask.id,
        label: label.trim(),
        description: this.descriptionEl.value.trim() || "",
        flagIds: this.flagSelector.selectedFlagIds,
        affectedToIds: this.contributorSelector.selectedContributorIds
      })
    } catch(err) {
      this.labelEl.value = this.currentTask.label
      this.descriptionEl.value = this.currentTask.description || ""
      this.flagSelector.refreshFlags()
      this.contributorSelector.refresh()
      console.error(`Error while updating task ${this.currentTask}: ${err}`)
    }
    this.hideSpinner()
  }

  private showSpinner() {
    this.submitSpinnerEl.style.display = "inline"
  }

  private hideSpinner() {
    this.submitSpinnerEl.style.display = "none"
  }
}
