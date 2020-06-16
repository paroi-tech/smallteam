require("./_SearchWorkspace.scss")
import { render } from "@tomko/lt-monkberry"
import { OwnDash } from "../../../App/OwnDash"
import { Model, TaskModel } from "../../../AppModel/AppModel"
import BoxList from "../../../generics/BoxList/BoxList"
import { ViewerController, Workspace } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import TaskBox from "../TaskBox/TaskBox"
import TaskForm from "../TaskForm/TaskForm"

const template = require("./SearchWorkspace.monk")

export default class SearchWorkspace implements Workspace {
  readonly el: HTMLElement
  private inputEl: HTMLInputElement

  private boxList: BoxList<TaskBox>
  private taskForm: TaskForm

  private model: Model

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    let view = render(template)

    this.el = view.rootEl()
    this.inputEl = view.ref("input")
    this.inputEl.addEventListener("keypress", ev => this.onSearch(ev))

    this.boxList = this.dash.create(BoxList, {
      title: "Search results"
    })
    view.ref("left").appendChild(this.boxList.el)

    this.taskForm = this.dash.create(TaskForm)
    view.ref("right").appendChild(this.taskForm.el)

    this.dash.listenTo("taskBoxSelected", task => {
      this.taskForm.setTask(task)
    })
  }

  activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el).setTitle("Search tasks")
  }

  private async onSearch(ev: KeyboardEvent) {
    if (ev.key !== "Enter")
      return

    let query = this.inputEl.value.trim()

    if (query.length !== 0) {
      this.boxList.clear()
      this.taskForm.setTask()
      try {
        let arr = await this.model.fetch("Task", { search: query })
        this.fillBoxList(arr)
      } catch (err) {
        this.dash.log.error("Unable to get search results", err)
      }
    }
  }

  private fillBoxList(arr: TaskModel[]) {
    for (let task of arr) {
      let box = this.dash.create(TaskBox, task)
      this.boxList.addBox(box)
    }
  }
}
