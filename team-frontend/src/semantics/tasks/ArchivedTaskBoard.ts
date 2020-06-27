import { Log } from "bkb"
import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { ARCHIVED_STEP_ID, Model, ProjectModel, TaskModel } from "../../AppModel/AppModel"
import { Collection } from "../../AppModel/modelDefinitions"
import BoxList from "../../generics/BoxList"
import TaskBox from "./TaskBox"
import TaskForm from "./TaskForm"

const template = handledom`
<div class="ArchivedTaskBoard">
  <div class="ArchivedTaskBoard-left" h="left"></div>
  <div class="ArchivedTaskBoard-right" h="right"></div>
</div>
`

export default class ArchivedTaskBoard {
  readonly el: HTMLElement

  private model: Model
  private log: Log

  private boxList: BoxList<TaskBox>
  private taskForm: TaskForm

  constructor(private dash: OwnDash, readonly project: ProjectModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    const { root, ref } = template()
    this.el = root

    this.boxList = this.dash.create(BoxList, {
      id: "taskList",
      title: "Tasks",
      sort: false
    })
    ref("left").appendChild(this.boxList.el)

    this.taskForm = this.dash.create(TaskForm, { noArchiveBtn: true })
    ref("right").appendChild(this.taskForm.el)

    this.dash.listenTo<TaskModel>("taskBoxSelected", task => this.taskForm.setTask(task))
    this.dash.listenToModel("updateTask", data => {
      const task = data.model
      if (task.projectId === this.project.id && task.curStepId === ARCHIVED_STEP_ID && !this.boxList.hasBox(task.id))
        this.addTaskBox(task)
    })
  }

  async refresh() {
    this.boxList.clear()
    const tasks = await this.fetchTasks()
    if (tasks)
      this.displayTasks(tasks)
  }

  private displayTasks(tasks: TaskModel[]) {
    for (const t of tasks) {
      if (t.id === t.project.rootTaskId)
        continue
      this.addTaskBox(t)
    }
  }

  private addTaskBox(task: TaskModel) {
    const box = this.dash.create(TaskBox, task)
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
