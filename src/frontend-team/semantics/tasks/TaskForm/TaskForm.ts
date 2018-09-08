import { OwnDash } from "../../../App/OwnDash"
import { Log } from "bkb"
import { TaskModel, Model, ARCHIVED_STEP_ID, ON_HOLD_STEP_ID } from "../../../AppModel/AppModel"
import { render, LtMonkberryView } from "@fabtom/lt-monkberry"
import TaskCommentEditor from "../TaskCommentEditor/TaskCommentEditor"
import FlagSelector from "../../flags/FlagSelector/FlagSelector"
import TaskLogViewer from "../TaskLogViewer/TaskLogViewer"
import AccountSelector from "../../accounts/AccountSelector/AccountSelector"
import TaskAttachmentManager from "../TaskAttachmentManager/TaskAttachmentManager"
import EditableTextField from "../../../generics/EditableTextField/EditableTextField"
import { AutoSave } from "../../../libraries/AutoSave"
import { TaskFragment } from "../../../../shared/meta/Task"
import Dialog from "../../../generics/Dialog/Dialog"
import TaskCommitViewer from "../TaskCommitViewer/TaskCommitViewer"

const template = require("./TaskForm.monk")

export default class TaskForm {
  readonly el: HTMLElement
  private spinnerEl: HTMLElement
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
  private commitViewer: TaskCommitViewer
  private logViewer: TaskLogViewer
  private text: EditableTextField

  private autoSave: AutoSave<TaskFragment>

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log
    this.autoSave = new AutoSave({
      logError: err => this.log.error(err),
      save: () => this.updateTask(),
      showSpinner: show => {
        // if (show)
        //   this.spinnerEl.setAttribute("hidden", "hidden")
        // else
        //   this.spinnerEl.removeAttribute("hidden")
        this.spinnerEl.hidden = !show
        console.log("this.spinnerEl.hidden", this.spinnerEl.hidden)
      }
    })

    this.view = render(template)
    this.el = this.view.rootEl()
    this.spinnerEl = this.view.ref("spinner")
    this.labelEl = this.view.ref("label")
    this.descriptionEl = this.view.ref("description")
    this.submitSpinnerEl = this.view.ref("submitSpinner")
    this.deleteSpinnerEl = this.view.ref("deleteSpinner")
    this.onHoldBtnEl = this.view.ref("btnOnHold")

    this.onHoldBtnEl.addEventListener("click", () => {
      if (!this.currentTask || this.currentTask.curStepId === ARCHIVED_STEP_ID)
        return
      if (this.currentTask.curStepId === ON_HOLD_STEP_ID)
        this.reactivateTask()
      else
        this.putTaskOnHold()
    })

    this.view.ref("submit").addEventListener("click", () => this.updateTask())
    this.view.ref("btnToggle").addEventListener("click", () => {
      if (this.currentTask)
        this.dash.emit("showStepSwitcher", this.currentTask)
    })
    this.view.ref("btnLog").addEventListener("click", () => {
      if (this.currentTask)
        this.dash.create(Dialog, this.logViewer.el, "Task logs").show()
    })
    this.view.ref("btnDelete").addEventListener("click", ev => {
      if (this.currentTask)
        this.deleteTask()
    })
    this.view.ref("btnArchive").addEventListener("click", ev => this.archiveTask())
    this.view.ref("btnCommits").addEventListener("click", ev => {
      if (this.currentTask)
      this.dash.create(Dialog, this.commitViewer.el, "Task commits").show()
    })

    this.flagSelector = this.dash.create(FlagSelector)
    this.view.ref("flag").appendChild(this.flagSelector.el)

    this.accountSelector = this.dash.create(AccountSelector)
    this.view.ref("account").appendChild(this.accountSelector.el)

    this.commentEditor = this.dash.create(TaskCommentEditor)
    this.view.ref("comment").appendChild(this.commentEditor.el)

    this.attachmentMgr = this.dash.create(TaskAttachmentManager)
    this.view.ref("attachment").appendChild(this.attachmentMgr.el)

    this.commitViewer = this.dash.create(TaskCommitViewer)

    this.logViewer = this.dash.create(TaskLogViewer)

    this.text = this.dash.create(EditableTextField)
    this.el.appendChild(this.text.el)

    this.dash.listenToModel("deleteTask", data => {
      if (this.currentTask !== undefined && this.currentTask.id === data.id)
        this.setTask()
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

    this.labelEl.addEventListener("input", () => this.autoSave.setSingle("label", this.labelEl.value))
    this.descriptionEl.addEventListener("input", () => this.autoSave.setSingle("description", this.descriptionEl.value))

  }

  get task(): TaskModel | undefined {
    return this.currentTask
  }

  setTask(task?: TaskModel) {
    this.autoSave.use(task)

    this.flagSelector.setTask(task)
    this.accountSelector.setTask(task)
    this.commentEditor.setTask(task)
    this.attachmentMgr.setTask(task)
    this.logViewer.setTask(task)
    this.commitViewer.setTask(task)

    this.currentTask = task

    this.updateOnHoldBtnLabel()
    this.view.update(task || {})

    this.el.hidden = !task
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
    if (!this.currentTask || this.currentTask.currentStep.isSpecial)
      return

    let label = this.labelEl.value.trim()
    if (label.length < 4) {
      this.log.info("Cannot update task with a label with less than 1 characters.")
      return
    }

    this.showSpinner()
    try {
      await this.model.exec("update", "Task", {
        id: this.currentTask.id,
        label: label.trim(),
        description: this.descriptionEl.value.trim() || "",
        flagIds: this.flagSelector.getSelectedFlagIds(),
        affectedToIds: this.accountSelector.selectedAccountIds
      })
    } catch(err) {
      this.refresh()
    }
    this.hideSpinner()
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
    if (!this.currentTask || this.currentTask.curStepId === ARCHIVED_STEP_ID)
      return false

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
      this.setTask()

      return result
  }

  private async putTaskOnHold() {
    if (!this.currentTask || this.currentTask.currentStep.isSpecial)
      return false

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
      this.setTask()

    return result
  }

  private async reactivateTask() {
    if (!this.currentTask || this.currentTask.curStepId !== ON_HOLD_STEP_ID)
      return false

    let stepIds = this.currentTask.project.stepIds

    if (stepIds.length === 0){
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
      this.setTask()

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
