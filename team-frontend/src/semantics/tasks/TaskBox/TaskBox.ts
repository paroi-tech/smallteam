require("./_TaskBox.scss")
import { render } from "@tomko/lt-monkberry"
import { removeAllChildren } from "../../../../../shared-ui/libraries/utils"
import { OwnDash } from "../../../App/OwnDash"
import { Model, TaskModel } from "../../../AppModel/AppModel"
import { Box } from "../../../generics/BoxList/BoxList"
import AccountAvatar from "../../accounts/AccountAvatar/AccountAvatar"
import TaskFlag from "../TaskFlag/TaskFlag"

const template = require("./TaskBox.monk")

/**
 * Component used to show basic information about a task of a project.
 *
 * A TaskBox emits (through the dash) a `taskBoxSelected` event when a user click on it.
 * The event provides the `TaskModel` that the box represents.
 */
export default class TaskBox implements Box {
  readonly el: HTMLElement
  private flagsEl: HTMLElement
  private avatarsEl: HTMLElement

  private model: Model

  /**
   * Create a new TaskBox.
   * @param dash - the current application dash
   * @param task - the task for which the box is created for
   */
  constructor(private dash: OwnDash, readonly task: TaskModel) {
    this.model = this.dash.app.model

    let view = render(template)
    let labelEl = view.ref("lbl")

    this.el = view.rootEl()
    labelEl.textContent = this.task.label

    this.avatarsEl = view.ref("avatars")
    this.addAccountAvatars()

    this.flagsEl = view.ref("flags")
    this.addTaskFlags()

    let commentsEl = view.ref("comments")
    commentsEl.textContent = (this.task.commentCount || 0).toString()

    this.dash.listenToModel("updateTask", data => {
      if (data.model === this.task) {
        labelEl.textContent = this.task.label
        removeAllChildren(this.flagsEl)
        this.addTaskFlags()
        removeAllChildren(this.avatarsEl)
        this.addAccountAvatars()
      }
    })

    this.dash.listenToModel("reorderFlag", data => {
      removeAllChildren(this.flagsEl)
      this.addTaskFlags()
    })

    view.ref("openBtn").addEventListener("click", () => this.dash.emit("taskBoxSelected", this.task))
  }

  get id() {
    return this.task.id
  }

  setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }

  private addAccountAvatars() {
    if (!this.task.affectedToIds)
      return
    for (let accountId of this.task.affectedToIds) {
      let account = this.model.global.accounts.get(accountId)
      if (account) {
        let comp = this.dash.create(AccountAvatar, { account, width: 16, height: 16 })
        this.avatarsEl.appendChild(comp.el)
      }
    }
  }

  private addTaskFlags() {
    if (!this.task.flagIds)
      return
    for (let flagId of this.task.flagIds) {
      let flag = this.model.global.flags.get(flagId)
      if (flag) {
        let flagComp = this.dash.create(TaskFlag, flag)
        this.flagsEl.appendChild(flagComp.el)
      }
    }
  }
}
