import QuestionDialog from "@smallteam/shared-ui/modal-dialogs/QuestionDialog"
import { Log } from "bkb"
import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { ARCHIVED_STEP_ID, Model, ON_HOLD_STEP_ID, TaskModel } from "../../AppModel/AppModel"
import { Dialog, DialogOptions } from "../../generics/Dialog"
import DelayedAction from "../../libraries/DelayedAction"
import AccountSelector from "../accounts/AccountSelector"
import FlagSelector from "../flags/FlagSelector"
import TaskAttachmentManager from "./TaskAttachmentManager"
import TaskCommentEditor from "./TaskCommentEditor"
import TaskCommitViewer from "./TaskCommitViewer"
import TaskLogViewer from "./TaskLogViewer"

const template = handledom`
<div class="TaskForm" hidden>
  <fieldset h="fieldset">
    <header class="TitleBar2">
      {{ code }}
      <span class="LoaderBg" hidden h="spinner"></span>
    </header>

    <div class="FieldGroup">
      <label class="FieldGroup-item Field">
        <span class="Field-lbl">Label</span>
        <input class="Field-input" type="text" value={{ label }} h="label">
      </label>

      <label class="FieldGroup-item Field">
        <span class="Field-lbl">Description</span>
        <textarea class="Field-input -textarea" value={{ description }} rows="4" placeholder="Task description" h="description">
        </textarea>
      </label>

      <div class="FieldGroup-item" h="flag"></div>
      <div class="FieldGroup-item" h="account"></div>

      <div class="FieldGroup-action">
        <button class="Btn WithLoader -right" type="button" h="submit">
          Submit <span class="WithLoader-l" hidden h="submitSpinner"></span>
        </button>
        <button class="Btn" type="button" h="archiveBtn">Archive task</button>
        <button class="Btn" type="button" h="postponeBtn">{{ postponeLabel }}</button>
      </div>

      <div class="FieldGroup-item" h="comment"></div>
      <div class="FieldGroup-item" h="attachment"></div>

      <div class="FieldGroup-action">
        <button class="Btn" h="toggleBtn">Sub-tasks</button>
        <button class="Btn" h="logBtn">Show logs</button>
        <button class="Btn" h="commitsBtn">Show commits</button>
      </div>

      <div class="FieldGroup-action">
        <button class="Btn WithLoader -right" h="btnDelete">
          Delete task <span class="WithLoader-l" hidden h="deleteSpinner"></span>
        </button>
      </div>
    </div>
  </fieldset>
</div>
`

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
  private archiveBtnEl: HTMLElement
  private postponeBtnEl: HTMLElement

  private update: (args: any) => void

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

    const { root, ref, update } = template()
    this.el = root
    this.update = update
    this.spinnerEl = ref("spinner")
    this.labelEl = ref("label")
    this.descriptionEl = ref("description")
    this.submitSpinnerEl = ref("submitSpinner")
    this.archiveBtnEl = ref("archiveBtn")
    this.postponeBtnEl = ref("postponeBtn")

    this.updateView()

    if (!this.options.noPostponeBtn) {
      this.postponeBtnEl.addEventListener("click", () => {
        if (!this.currentTask || this.currentTask.curStepId === ARCHIVED_STEP_ID)
          return
        if (this.currentTask.curStepId === ON_HOLD_STEP_ID)
          this.reactivateTask().catch(err => this.dash.log.error(err))
        else
          this.putTaskOnHold().catch(err => this.dash.log.error(err))
      })
    }

    if (!this.options.noArchiveBtn)
      this.archiveBtnEl.addEventListener("click", () => this.archiveTask())

    ref("submit").addEventListener("click", () => this.updateTask())

    ref("toggleBtn").addEventListener("click", () => {
      if (this.currentTask)
        this.dash.emit("showStepSwitcher", this.currentTask)
    })

    ref("logBtn").addEventListener("click", () => {
      if (this.currentTask)
        this.logViewer.open().catch(err => this.dash.log.error(err))
    })

    ref("btnDelete").addEventListener("click", () => {
      if (this.currentTask)
        this.deleteTask().catch(err => this.dash.log.error(err))
    })

    ref("commitsBtn").addEventListener("click", () => {
      if (this.currentTask)
        this.commitViewer.open().catch(err => this.dash.log.error(err))
    })

    this.flagSelector = this.dash.create(FlagSelector)
    ref("flag").appendChild(this.flagSelector.el)

    this.accountSelector = this.dash.create(AccountSelector)
    ref("account").appendChild(this.accountSelector.el)

    this.commentEditor = this.dash.create(TaskCommentEditor)
    ref("comment").appendChild(this.commentEditor.el)

    this.attachmentMgr = this.dash.create(TaskAttachmentManager)
    ref("attachment").appendChild(this.attachmentMgr.el)

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

    const label = this.labelEl.value.trim()
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

    const msg = `Do you really want to archive task ${this.currentTask.code}?`

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

    const msg = `Do you really want to put task ${this.currentTask.code} on hold?`

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

    const msg = `Do you really want to activate task ${this.currentTask.code}?`

    if (!await this.dash.create(QuestionDialog).show(msg, "Confirm action"))
      return

    const stepIds = this.currentTask.project.stepIds

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
    const task = this.currentTask
    const code = task ? task.code : ""
    const label = task ? task.label : ""
    const description = task && task.description ? task.description : ""
    const postponeLabel = !task || task.curStepId !== ON_HOLD_STEP_ID ? "Postpone" : "Activate"

    const showArchiveBtn = !this.options.noArchiveBtn
    const showPostponeBtn = !this.options.noPostponeBtn

    this.archiveBtnEl.hidden = !showArchiveBtn
    this.postponeBtnEl.hidden = !showPostponeBtn

    this.update({
      code,
      label,
      description,
      postponeLabel
    })
  }
}
