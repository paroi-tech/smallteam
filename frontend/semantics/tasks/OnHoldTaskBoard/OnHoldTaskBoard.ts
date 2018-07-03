import { OwnDash } from "../../../App/OwnDash"
import { Log } from "bkb"
import { ProjectModel, Model, TaskModel, ON_HOLD_STEP_ID } from "../../../AppModel/AppModel"
import { render } from "@fabtom/lt-monkberry"
import BoxList from "../../../generics/BoxList/BoxList"
import TaskBox from "../TaskBox/TaskBox"
import TaskForm from "../TaskForm/TaskForm"
import { Collection } from "../../../AppModel/modelDefinitions"

const template = require("./OnHoldTaskBoard.monk")

export default class OnHoldTaskBoard {
  readonly el: HTMLElement
  private overlayEl: HTMLElement

  private model: Model
  private log: Log

  private boxList: BoxList<TaskBox>
  private taskForm: TaskForm

  constructor(private dash: OwnDash, readonly project: ProjectModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    let view = render(template)
    this.el = view.rootEl()
    this.overlayEl = view.ref("overlay")

    this.boxList = this.dash.create(BoxList, {
      id: "taskList",
      name: "Tasks",
      sort: false
    })
    view.ref("left").appendChild(this.boxList.el)

    this.taskForm = this.dash.create(TaskForm)
    view.ref("right").appendChild(this.taskForm.el)

    this.dash.listenTo<TaskModel>("taskBoxSelected", task => this.taskForm.task = task)
  }

  public async refresh() {
    this.showOverlay()
    this.boxList.clear()
    let tasks = await this.fetchTasks()
    if (tasks)
      this.displayTasks(tasks)
    this.hideOverlay()
  }

  private displayTasks(tasks: TaskModel[]) {
    for (let t of tasks) {
      if (t.id === t.project.rootTaskId)
        continue
      let box = this.dash.create(TaskBox, t)
      this.boxList.addBox(box)
    }
  }

  private async fetchTasks() {
    let tasks: Collection<TaskModel, string> | undefined = undefined
    try {
      tasks = await this.model.fetch("Task", {
        projectId: this.project.id,
        curStepId: ON_HOLD_STEP_ID
      })
    } catch (error) {
      this.log.error("Cannot fetch on hold tasks for project", this.project.id)
    }
    return tasks
  }

  private showOverlay() {
    this.overlayEl.style.display = "block"
  }

  private hideOverlay() {
    this.overlayEl.style.display = "none"
  }
}
