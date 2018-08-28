import { Log } from "bkb"
import { render, LtMonkberryView } from "@fabtom/lt-monkberry"
import TaskCommentEditor from "../TaskCommentEditor/TaskCommentEditor"
import { TaskModel, Model, ARCHIVED_STEP_ID, ON_HOLD_STEP_ID } from "../../../AppModel/AppModel"
import FlagSelector from "../../flags/FlagSelector/FlagSelector"
import TaskLogDialog from "../TaskLogDialog/TaskLogDialog"
import AccountSelector from "../../accounts/AccountSelector/AccountSelector"
import TaskAttachmentManager from "../TaskAttachmentManager/TaskAttachmentManager"
import { OwnDash } from "../../../App/OwnDash"
import EditableTextField from "../../../generics/EditableTextField/EditableTextField"

const template = require("./TaskForm.monk")

export default class TaskForm {
  readonly el: HTMLElement
  private fieldsetEl: HTMLFieldSetElement
  private labelEl: HTMLInputElement
  private descriptionEl: HTMLTextAreaElement
  private submitSpinnerEl: HTMLElement
  private deleteSpinnerEl: HTMLElement
  private onHoldBtnEl: HTMLElement

  private view: LtMonkberryView

  private currentTask: TaskModel | undefined
  private model: Model
  private log: Log

  private commentEditor: TaskCommentEditor
  private flagSelector: FlagSelector
  private accountSelector: AccountSelector
  private attachmentMgr: TaskAttachmentManager
  private logDialog: TaskLogDialog
  private text: EditableTextField

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
    this.onHoldBtnEl = this.view.ref("btnOnHold")

    this.onHoldBtnEl.addEventListener("click", ev => {
      if (!this.currentTask || this.currentTask.curStepId === ARCHIVED_STEP_ID)
        return
      if (this.currentTask.curStepId === ON_HOLD_STEP_ID)
        this.reactivateTask()
      else
        this.putTaskOnHold()
    })
    this.view.ref("submit").addEventListener("click", ev => this.updateTask())
    this.view.ref("btnToggle").addEventListener("click", ev => {
      if (this.currentTask)
        this.dash.emit("showStepSwitcher", this.currentTask)
    })
    this.view.ref("btnLog").addEventListener("click", ev => {
      if (!this.currentTask)
        return
      this.logDialog.show()
    })
    this.view.ref("btnDelete").addEventListener("click", ev => {
      if (this.currentTask)
        this.deleteTask()
    })
    this.view.ref("btnArchive").addEventListener("click", ev => this.archiveTask())

    this.flagSelector = this.dash.create(FlagSelector)
    this.view.ref("flag").appendChild(this.flagSelector.el)

    this.accountSelector = this.dash.create(AccountSelector)
    this.view.ref("account").appendChild(this.accountSelector.el)

    this.commentEditor = this.dash.create(TaskCommentEditor)
    this.view.ref("comment").appendChild(this.commentEditor.el)

    this.attachmentMgr = this.dash.create(TaskAttachmentManager)
    this.view.ref("attachment").appendChild(this.attachmentMgr.el)

    this.logDialog = this.dash.create(TaskLogDialog)

    this.text = this.dash.create(EditableTextField)
    this.el.appendChild(this.text.el)

    this.listenToModel()
    this.hide() // TaskForm is hidden by default.
  }

  public reset() {
    this.currentTask = undefined
    this.view.update({
      description: "",
      label: ""
    })
    this.updateOnHoldBtnLabel()
    this.resetChildComponents()
  }

  public hide() {
    this.el.hidden = true
  }

  public show() {
    this.el.hidden = false
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
    this.updateOnHoldBtnLabel()
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
      this.view.update({
        description: this.currentTask.description || "",
        label: this.currentTask.label
      })
      this.updateOnHoldBtnLabel()
    })
  }

  private resetChildComponents() {
    this.flagSelector.task = undefined
    this.accountSelector.task = undefined
    this.commentEditor.task = undefined
    this.attachmentMgr.task = undefined
    this.logDialog.task = undefined
  }

  private setTaskInChildComponents(task: TaskModel) {
    this.flagSelector.task = task
    this.accountSelector.task = task
    this.commentEditor.task = task
    this.attachmentMgr.task = task
    this.logDialog.task = task
  }

  private async deleteTask() {
    if (!this.currentTask || (this.currentTask.children || []).length > 0)
      return
    if (!confirm("Do you really want to remove this task?"))
      return
    try {
      await this.model.exec("delete", "Task", { id: this.currentTask.id })
    } catch (error) {
      this.log.info("Unable to delete task", error)
    }
  }

  private async updateTask() {
    if (!this.currentTask || this.currentTask.currentStep.isSpecial) {
      console.log("Cannot update task which current step is special.")
      return false
    }

    let label = this.labelEl.value.trim()
    if (label.length < 4) {
      this.log.info("Cannot update task with a label with less than 4 characters.")
      return false
    }

    this.showSpinner()
    let result = false
    try {
      await this.model.exec("update", "Task", {
        id: this.currentTask.id,
        label: label.trim(),
        description: this.descriptionEl.value.trim() || "",
        flagIds: this.flagSelector.selectedFlagIds,
        affectedToIds: this.accountSelector.selectedAccountIds
      })
      result = true
    } catch(err) {
      this.refresh()
    }
    this.hideSpinner()
    return result
  }

  /**
   * Never call the reset() method in this method.
   */
  private refresh() {
    if (!this.currentTask)
      return
    let description = this.currentTask.description || ""
    this.view.update({
      label: this.currentTask.label,
      description
    })
    this.updateOnHoldBtnLabel()
    this.flagSelector.refreshFlags()
    this.accountSelector.refresh()
  }

  private async archiveTask() {
    if (!this.currentTask || this.currentTask.curStepId === ARCHIVED_STEP_ID) {
      console.log("Cannot archive as task twice...")
      return false
    }
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
    if (result)
      this.reset()
    return result
  }

  private async putTaskOnHold() {
    if (!this.currentTask || this.currentTask.currentStep.isSpecial) {
      console.log("Cannot put on hold a task which current step is special...")
      return false
    }
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
    if (result)
      this.reset()
    return result
  }

  private async reactivateTask() {
    if (!this.currentTask || this.currentTask.curStepId !== ON_HOLD_STEP_ID) {
      console.log("Cannot reactivate a task which is not on hold...")
      return false
    }
    let stepIds = this.currentTask.project.stepIds
    if (stepIds.length === 0){
      console.log("Cannot activate a task which project has no step...")
      return
    }
    this.showSpinner()
    let result = false
    try {
      await this.model.exec("update", "Task", {
        id: this.currentTask.id,
        curStepId: stepIds[0]
      } as any)
      result = true
    } catch(err) {
      this.log.error("Unable to reactivate task", err)
    }
    this.hideSpinner()
    if (result)
      this.reset()
    return result
  }

  private showSpinner() {
    this.submitSpinnerEl.hidden = false
  }

  private hideSpinner() {
    this.submitSpinnerEl.hidden = true
  }

  private updateOnHoldBtnLabel() {
    if (!this.currentTask || this.currentTask.curStepId !== ON_HOLD_STEP_ID)
      this.onHoldBtnEl.textContent = "Put on hold"
    else
      this.onHoldBtnEl.textContent = "Reactivate task"
  }
}