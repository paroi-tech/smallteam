import { Log } from "bkb"
import { render, LtMonkberryView } from "@fabtom/lt-monkberry"
import TaskCommentEditor from "../TaskCommentEditor/TaskCommentEditor"
import { TaskModel, Model, ARCHIVED_STEP_ID, ON_HOLD_STEP_ID } from "../../../AppModel/AppModel"
import FlagSelector from "../../flags/FlagSelector/FlagSelector"
import TaskLogDialog from "../TaskLogDialog/TaskLogDialog"
import ContributorSelector from "../../contributors/ContributorSelector/ContributorSelector"
import TaskAttachmentManager from "../TaskAttachmentManager/TaskAttachmentManager"
import { OwnDash } from "../../../App/OwnDash"

const template = require("./TaskForm.monk")

export default class TaskForm {
  readonly el: HTMLElement
  private fieldsetEl: HTMLFieldSetElement
  private labelEl: HTMLInputElement
  private descriptionEl: HTMLTextAreaElement
  private submitSpinnerEl: HTMLElement
  private deleteSpinnerEl: HTMLElement

  private view: LtMonkberryView

  private currentTask: TaskModel | undefined
  private model: Model
  private log: Log

  private commentEditor: TaskCommentEditor
  private flagSelector: FlagSelector
  private contributorSelector: ContributorSelector
  private logDialog: TaskLogDialog
  private attachmentMgr: TaskAttachmentManager

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.view = render(template)
    this.el = this.view.rootEl()
    this.fieldsetEl = this.view.ref("fieldset")
    this.labelEl = this.view.ref("label")
    this.descriptionEl = this.view.ref("description")
    this.submitSpinnerEl = this.view.ref("submitSpinner")
    this.deleteSpinnerEl = this.view.ref("deleteSpinner")

    this.view.ref("submit").addEventListener("click", ev => this.updateTask())
    this.view.ref("btnToggle").addEventListener("click", ev => {
      if (this.currentTask)
        this.dash.emit("showStepSwitcher", this.currentTask)
    })
    this.view.ref("btnLog").addEventListener("click", ev => {
      if (this.currentTask)
        this.logDialog.show()
    })
    this.view.ref("btnDelete").addEventListener("click", ev => {
      if (this.currentTask)
        this.deleteTask()
    })
    this.view.ref("btnArchive").addEventListener("click", ev => this.archiveTask())
    this.view.ref("btnOnHold").addEventListener("click", ev => this.putTaskOnHold())

    this.flagSelector = this.dash.create(FlagSelector)
    this.view.ref("fselector").appendChild(this.flagSelector.el)

    this.contributorSelector = this.dash.create(ContributorSelector)
    this.view.ref("cselector").appendChild(this.contributorSelector.el)

    this.commentEditor = this.dash.create(TaskCommentEditor)
    this.view.ref("comment").appendChild(this.commentEditor.el)

    this.logDialog = this.dash.create(TaskLogDialog)

    this.attachmentMgr = this.dash.create(TaskAttachmentManager)
    this.view.ref("attachment").appendChild(this.attachmentMgr.el)

    this.listenToModel()
    this.hide() // TaskForm is hidden by default.
  }

  public reset() {
    this.currentTask = undefined
    this.view.update({
      description: "",
      label: ""
    })
    this.resetChildComponents()
  }

  public hide() {
    this.el.style.display = "none"
  }

  public show() {
    this.el.style.display = ""
  }

  get task(): TaskModel | undefined {
    return this.currentTask
  }

  set task(task: TaskModel | undefined) {
    this.reset()
    if (!task)
      return
    this.currentTask = task
    this.view.update({
      description: task.description || "",
      label: task.label
    })
    this.show()
    this.setTaskInChildComponents(task)
  }

  private listenToModel() {
    this.dash.listenToModel("deleteTask", data => {
      if (this.currentTask !== undefined && this.currentTask.id === data.id)
        this.reset()
    })
    this.dash.listenToModel("updateTask", data => {
      if (!this.currentTask || this.currentTask.id !== data.id)
        return
      // We check if the task has been archived or put on hold.
      if (this.currentTask.currentStep.isSpecial) {
        this.reset()
        return
      }
      this.view.update({
        description: this.currentTask.description || "",
        label: this.currentTask.label
      })
    })
  }

  private resetChildComponents() {
    this.flagSelector.task = undefined
    this.contributorSelector.task = undefined
    this.commentEditor.task = undefined
    this.logDialog.task = undefined
    this.attachmentMgr.task = undefined
  }

  private setTaskInChildComponents(task: TaskModel) {
    this.flagSelector.task = task
    this.contributorSelector.task = task
    this.commentEditor.task = task
    this.logDialog.task = task
    this.attachmentMgr.task = task
  }

  private async deleteTask() {
    if (!this.currentTask || (this.currentTask.children || []).length > 0)
      return
    if (!confirm("Do you really want to remove this task?"))
      return
    try {
      // We handle task deletion event in another place.
      await this.model.exec("delete", "Task", { id: this.currentTask.id })
    } catch (error) {
      this.log.info("Unable to delete task", error)
    }
  }

  private async updateTask() {
    if (!this.currentTask)
      return false

    let label = this.labelEl.value.trim()
    if (label.length < 4)
      return false

    this.showSpinner()
    let result = false
    try {
      await this.model.exec("update", "Task", {
        id: this.currentTask.id,
        label: label.trim(),
        description: this.descriptionEl.value.trim() || "",
        flagIds: this.flagSelector.selectedFlagIds,
        affectedToIds: this.contributorSelector.selectedContributorIds
      })
      result = true
    } catch(err) {
      this.refresh()
    }
    this.hideSpinner()
    return result
  }

  private refresh() {
    if (!this.currentTask)
      return
    let description = this.currentTask.description || ""
    this.view.update({
      label: this.currentTask.label,
      description
    })
    this.flagSelector.refreshFlags()
    this.contributorSelector.refresh()
  }

  private async archiveTask() {
    if (!this.currentTask)
      return
    this.showSpinner()
    let result = false
    try {
      await this.model.exec("update", "Task", {
        id: this.currentTask.id,
        curStepId: ARCHIVED_STEP_ID
      } as any)
      result = true
    } catch(err) {
      this.log.error("Unable to archive task", err)
    }
    this.hideSpinner()
  }

  private async putTaskOnHold() {
    if (!this.currentTask)
      return
    this.showSpinner()
    let result = false
    try {
      await this.model.exec("update", "Task", {
        id: this.currentTask.id,
        curStepId: ON_HOLD_STEP_ID
      } as any)
      result = true
    } catch(err) {
      this.log.error("Unable to put task on hold", err)
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
