require("./_TaskForm.scss")
import { LtMonkberryView, render } from "@tomko/lt-monkberry"
import { Log } from "bkb"
import { QuestionDialog } from "../../../../../shared-ui/modalDialogs/modalDialogs"
import { OwnDash } from "../../../App/OwnDash"
import { ARCHIVED_STEP_ID, Model, ON_HOLD_STEP_ID, TaskModel } from "../../../AppModel/AppModel"
import { Dialog, DialogOptions } from "../../../generics/Dialog/Dialog"
import DelayedAction from "../../../libraries/DelayedAction"
import AccountSelector from "../../accounts/AccountSelector"
import FlagSelector from "../../flags/FlagSelector"
import TaskAttachmentManager from "../TaskAttachmentManager/TaskAttachmentManager"
import TaskCommentEditor from "../TaskCommentEditor/TaskCommentEditor"
import TaskCommitViewer from "../TaskCommitViewer/TaskCommitViewer"
import TaskLogViewer from "../TaskLogViewer/TaskLogViewer"

const template = require("./TaskForm.monk")

interface TaskFormOptions {
  noArchiveBtn?: boolean
  noPostponeBtn?: boolean
}

export default class TaskForm {
  readonly el: HTMLElement
  private spinnerEl: HTMLElement
  private labelEl: HTMLInputElement
  private descriptionEl: HTMLTextAreaElement
  private submitSpinnerEl: HTMLElement

  private view: LtMonkberryView

  private currentTask: TaskModel | undefined
  private model: Model
  private log: Log

  private commentEditor: TaskCommentEditor
  private flagSelector: FlagSelector
  private accountSelector: AccountSelector
  private attachmentMgr: TaskAttachmentManager
  private commitViewer: Dialog<TaskCommitViewer>
  private logViewer: Dialog<TaskLogViewer>

  private delayedSave: DelayedAction

  private options: Required<TaskFormOptions>

  constructor(private dash: OwnDash, options?: TaskFormOptions) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log
    this.options = {
      noArchiveBtn: (options && options.noArchiveBtn) || false,
      noPostponeBtn: (options && options.noPostponeBtn) || false
    }

    this.delayedSave = new DelayedAction({
      action: () => this.updateTask(),
      onChangeStatus: status => {
        this.spinnerEl.hidden = !status
        if (status === "delaying")
          this.spinnerEl.classList.add("-delaying")
        else
          this.spinnerEl.classList.remove("-delaying")
      },
      logError: err => this.log.error(err)
    })

    this.view = render(template)
    this.updateView()
    this.el = this.view.rootEl()
    this.spinnerEl = this.view.ref("spinner")
    this.labelEl = this.view.ref("label")
    this.descriptionEl = this.view.ref("description")
    this.submitSpinnerEl = this.view.ref("submitSpinner")

    if (!this.options.noPostponeBtn) {
      this.view.ref("btnPostpone").addEventListener("click", () => {
        if (!this.currentTask || this.currentTask.curStepId === ARCHIVED_STEP_ID)
          return
        if (this.currentTask.curStepId === ON_HOLD_STEP_ID)
          this.reactivateTask()
        else
          this.putTaskOnHold()
      })
    }

    if (!this.options.noArchiveBtn)
      this.view.ref("btnArchive").addEventListener("click", () => this.archiveTask())

    this.view.ref("submit").addEventListener("click", () => this.updateTask())

    this.view.ref("btnToggle").addEventListener("click", () => {
      if (this.currentTask)
        this.dash.emit("showStepSwitcher", this.currentTask)
    })

    this.view.ref("btnLog").addEventListener("click", () => {
      if (this.currentTask)
        this.logViewer.open()
    })

    this.view.ref("btnDelete").addEventListener("click", () => {
      if (this.currentTask)
        this.deleteTask()
    })

    this.view.ref("btnCommits").addEventListener("click", () => {
      if (this.currentTask)
        this.commitViewer.open()
    })

    this.flagSelector = this.dash.create(FlagSelector)
    this.view.ref("flag").appendChild(this.flagSelector.el)

    this.accountSelector = this.dash.create(AccountSelector)
    this.view.ref("account").appendChild(this.accountSelector.el)

    this.commentEditor = this.dash.create(TaskCommentEditor)
    this.view.ref("comment").appendChild(this.commentEditor.el)

    this.attachmentMgr = this.dash.create(TaskAttachmentManager)
    this.view.ref("attachment").appendChild(this.attachmentMgr.el)

    this.commitViewer = this.dash.create<Dialog<TaskCommitViewer>, DialogOptions<TaskCommitViewer>>(Dialog, {
      content: this.dash.create(TaskCommitViewer),
      title: "Task commits"
    })

    this.logViewer = this.dash.create<Dialog<TaskLogViewer>, DialogOptions<TaskLogViewer>>(Dialog, {
      content: this.dash.create(TaskLogViewer),
      title: "Task logs"
    })

    this.dash.listenToModel("deleteTask", data => {
      if (this.currentTask !== undefined && this.currentTask.id === data.id)
        this.setTask()
    })
    this.dash.listenToModel("updateTask", data => {
      if (!this.currentTask || this.currentTask.id !== data.id)
        return
      this.updateView()
    })

    this.labelEl.addEventListener("input", () => this.delayedSave.delay())
    this.descriptionEl.addEventListener("input", () => this.delayedSave.delay())

    this.dash.listenTo("change", () => this.delayedSave.delay())
  }

  get task(): TaskModel | undefined {
    return this.currentTask
  }

  setTask(task?: TaskModel) {
    this.delayedSave.reset({ flush: true })

    this.flagSelector.setTask(task)
    this.accountSelector.setTask(task)
    this.commentEditor.setTask(task)
    this.attachmentMgr.setTask(task)
    this.logViewer.content.setTask(task)
    this.commitViewer.content.setTask(task)

    this.currentTask = task
    this.updateView()

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
    } catch (err) {
      this.refresh()
    }
    this.hideSpinner()
  }

  private refresh() {
    if (!this.currentTask)
      return
    this.updateView()
    this.flagSelector.setTask(this.task)
    this.accountSelector.refresh()
  }

  private async archiveTask() {
    if (!this.currentTask || this.currentTask.curStepId === ARCHIVED_STEP_ID)
      return false

    let msg = `Do you really want to archive task ${this.currentTask.code}?`

    if (!await this.dash.create(QuestionDialog).show(msg, "Confirm action"))
      return

    this.showSpinner()

    let result = false

    try {
      await this.model.exec("update", "Task", {
        id: this.currentTask.id,
        curStepId: ARCHIVED_STEP_ID
      } as any)
      result = true
    } catch (err) {
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

    let msg = `Do you really want to put task ${this.currentTask.code} on hold?`

    if (!await this.dash.create(QuestionDialog).show(msg, "Confirm action"))
      return

    this.showSpinner()

    let result = false

    try {
      await this.model.exec("update", "Task", {
        id: this.currentTask.id,
        curStepId: ON_HOLD_STEP_ID
      } as any)
      result = true
    } catch (err) {
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

    let msg = `Do you really want to activate task ${this.currentTask.code}?`

    if (!await this.dash.create(QuestionDialog).show(msg, "Confirm action"))
      return

    let stepIds = this.currentTask.project.stepIds

    if (stepIds.length === 0) {
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
    } catch (err) {
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

  private updateView() {
    let task = this.currentTask
    let code = task ? task.code : ""
    let label = task ? task.label : ""
    let description = task && task.description ? task.description : ""
    let showArchiveBtn = !this.options.noArchiveBtn
    let showPostponeBtn = !this.options.noPostponeBtn
    let activeTask = (!task || task.curStepId !== ON_HOLD_STEP_ID) ? "Postpone" : "Activate task"

    this.view.update({
      code,
      label,
      description,
      showArchiveBtn,
      showPostponeBtn,
      activeTask
    })
  }
}
