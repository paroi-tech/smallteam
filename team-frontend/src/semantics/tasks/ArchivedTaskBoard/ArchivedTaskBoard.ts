require("./_ArchivedTaskBoard.scss")
import { render } from "@tomko/lt-monkberry"
import { Log } from "bkb"
import { OwnDash } from "../../../App/OwnDash"
import { ARCHIVED_STEP_ID, Model, ProjectModel, TaskModel } from "../../../AppModel/AppModel"
import { Collection } from "../../../AppModel/modelDefinitions"
import BoxList from "../../../generics/BoxList/BoxList"
import TaskBox from "../TaskBox/TaskBox"
import TaskForm from "../TaskForm/TaskForm"

const template = require("./ArchivedTaskBoard.monk")

export default class ArchivedTaskBoard {
  readonly el: HTMLElement

  private model: Model
  private log: Log

  private boxList: BoxList<TaskBox>
  private taskForm: TaskForm

  constructor(private dash: OwnDash, readonly project: ProjectModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    let view = render(template)
    this.el = view.rootEl()

    this.boxList = this.dash.create(BoxList, {
      id: "taskList",
      title: "Tasks",
      sort: false
    })
    view.ref("left").appendChild(this.boxList.el)

    this.taskForm = this.dash.create(TaskForm, { noArchiveBtn: true })
    view.ref("right").appendChild(this.taskForm.el)

    this.dash.listenTo<TaskModel>("taskBoxSelected", task => this.taskForm.setTask(task))
    this.dash.listenToModel("updateTask", data => {
      let task = data.model
      if (task.projectId === this.project.id && task.curStepId === ARCHIVED_STEP_ID && !this.boxList.hasBox(task.id))
        this.addTaskBox(task)
    })
  }

  async refresh() {
    this.boxList.clear()
    let tasks = await this.fetchTasks()
    if (tasks)
      this.displayTasks(tasks)
  }

  private displayTasks(tasks: TaskModel[]) {
    for (let t of tasks) {
      if (t.id === t.project.rootTaskId)
        continue
      this.addTaskBox(t)
    }
  }

  private addTaskBox(task: TaskModel) {
    let box = this.dash.create(TaskBox, task)
    this.boxList.addBox(box)
  }

  private async fetchTasks() {
    let tasks: Collection<TaskModel, string> | undefined

    try {
      tasks = await this.model.fetch("Task", {
        projectId: this.project.id,
        curStepId: ARCHIVED_STEP_ID
      })
    } catch (error) {
      this.log.error("Cannot fetch on hold tasks for project", this.project.id)
    }

    return tasks
  }
}