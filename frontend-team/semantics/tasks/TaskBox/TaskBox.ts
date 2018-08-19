import TaskFlag from "../TaskFlag/TaskFlag"
import { Model, TaskModel } from "../../../AppModel/AppModel"
import { Box } from "../../../generics/BoxList/BoxList"
import ContributorFlag from "../../contributors/ContributorFlag/ContributorFlag"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"
import { removeAllChildren } from "../../../../sharedFrontend/libraries/utils";

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
  private usersEl: HTMLElement

  private model: Model

  /**
   * Create a new TaskBox.
   * @param dash - the current application dash
   * @param task - the task for which the box is created for
   */
  constructor(private dash: OwnDash, readonly task: TaskModel) {
    this.model = this.dash.app.model

    let view = render(template)
    this.el = view.rootEl()
    let labelEl = view.ref("lbl")
    labelEl.textContent = this.task.label

    this.usersEl = view.ref("users")
    this.addContributorFlags()

    this.flagsEl = view.ref("flags")
    this.addTaskFlags()

    let commentsEl = view.ref("comments")
    commentsEl.textContent = (this.task.commentCount || 0).toString()

    this.dash.listenToModel("updateTask", data => {
      if (data.model === this.task) {
        labelEl.textContent = this.task.label
        removeAllChildren(this.flagsEl)
        this.addTaskFlags()
        removeAllChildren(this.usersEl)
        this.addContributorFlags()
      }
    })

    this.dash.listenToModel("reorderFlag", data => {
      removeAllChildren(this.flagsEl)
      this.addTaskFlags()
    })

    view.ref("openBtn").addEventListener("click", ev => this.dash.emit("taskBoxSelected", this.task))
  }

  get id() {
    return this.task.id
  }

  public setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }

  private addContributorFlags() {
    if (!this.task.affectedToIds)
      return
    for (let contributorId of this.task.affectedToIds) {
      let contributor = this.model.global.contributors.get(contributorId)
      if (contributor) {
        let comp = this.dash.create(ContributorFlag, contributor)
        this.usersEl.appendChild(comp.el)
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
