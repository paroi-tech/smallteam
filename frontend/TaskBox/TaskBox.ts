import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Box } from "../BoxList/BoxList"
import TaskFlag from "../TaskFlag/TaskFlag"
import ContributorFlag from "../ContributorFlag/ContributorFlag"
import { Model, TaskModel } from "../AppModel/AppModel"
import { UpdateModelEvent, ReorderModelEvent } from "../AppModel/ModelEngine"
import { render } from "monkberry"
import { removeAllChildren } from "../libraries/utils"

import * as template from "./taskbox.monk"

/**
 * Component used to show basic information about a task of a project.
 *
 * A TaskBox emits (through the dash) a `taskBoxSelected` event when a user click on it.
 * The event provides the `TaskModel` that the box represents.
 */
export default class TaskBox implements Box {
  readonly el: HTMLElement
  readonly id: string

  private spanEl: HTMLElement
  private flagContainerEl: HTMLElement
  private contributorContainerEl: HTMLElement

  private view: MonkberryView

  private model: Model

  /**
   * Create a new TaskBox.
   * @param dash - the current application dash
   * @param task - the task for which the box is created for
   */
  constructor(private dash: Dash<App>, readonly task: TaskModel) {
    this.id = this.task.id
    this.model = this.dash.app.model

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement

    this.spanEl = this.el.querySelector(".js-span") as HTMLElement
    this.spanEl.textContent = this.task.label

    this.flagContainerEl = this.el.querySelector(".js-container-left") as HTMLElement
    this.contributorContainerEl = this.el.querySelector(".js-container-right") as HTMLElement

    this.addTaskFlags()
    this.addContributorFlags()
    this.listenToModel()
    this.el.addEventListener("click", ev => this.dash.emit("taskBoxSelected", this.task))
  }

  private addContributorFlags() {
    if (!this.task.affectedToIds)
      return
    for (let contributorId of this.task.affectedToIds) {
      let contributor = this.model.global.contributors.get(contributorId)
      if (contributor) {
        let comp = this.dash.create(ContributorFlag, contributor)
        this.contributorContainerEl.appendChild(comp.el)
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
        this.flagContainerEl.appendChild(flagComp.el)
      }
    }
  }

  private listenToModel() {
    // Task update.
    this.dash.listenTo<UpdateModelEvent>(this.model, "updateTask").onData(data => {
      let task = data.model as TaskModel
      if (task.id === this.task.id) {
        this.spanEl.textContent = task.label
        // Update the flags.
        removeAllChildren(this.flagContainerEl)
        this.addTaskFlags()
      }
    })

    // Listen to flag reorder event.
    this.dash.listenTo<ReorderModelEvent>(this.model, "reorder").onData(data => {
      if (data.type !== "Flag")
        return
      console.log("taskbox got reorder event")
      console.log("number of flags:", this.flagContainerEl.childNodes.length)
      removeAllChildren(this.flagContainerEl)
      console.log("number of flags:", this.flagContainerEl.childNodes.length)
      this.addTaskFlags()
    })
  }

  public setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }
}
