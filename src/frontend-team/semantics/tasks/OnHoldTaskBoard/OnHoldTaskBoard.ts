import { render } from "@fabtom/lt-monkberry"
import { Log } from "bkb"
import { OwnDash } from "../../../App/OwnDash"
import { Model, ON_HOLD_STEP_ID, ProjectModel, TaskModel } from "../../../AppModel/AppModel"
import { Collection } from "../../../AppModel/modelDefinitions"
import BoxList from "../../../generics/BoxList/BoxList"
import TaskBox from "../TaskBox/TaskBox"
import TaskForm from "../TaskForm/TaskForm"

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
      title: "Tasks",
      sort: false
    })
    view.ref("left").appendChild(this.boxList.el)

    this.taskForm = this.dash.create(TaskForm)
    view.ref("right").appendChild(this.taskForm.el)

    this.dash.listenTo<TaskModel>("taskBoxSelected", task => this.taskForm.setTask(task))
    this.dash.listenToModel("updateTask", data => {
      let task = data.model
      if (task.projectId === this.project.id && task.curStepId === ON_HOLD_STEP_ID && !this.boxList.hasBox(task.id))
        this.addTaskBox(task)
    })
  }

  async refresh() {
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
      this.addTaskBox(t)
    }
  }

  private addTaskBox(task: TaskModel) {
    this.boxList.addBox(this.dash.create(TaskBox, task))
  }

  private async fetchTasks() {
    let tasks: Collection<TaskModel, string> | undefined

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
    this.overlayEl.hidden = false
  }

  private hideOverlay() {
    this.overlayEl.hidden = true
  }
}
