import { Dash } from "bkb"
import App from "../../../App/App"
import { render } from "@fabtom/lt-monkberry"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import { Model, UpdateModelEvent, TaskModel } from "../../../AppModel/AppModel"
import BoxList from "../../../generics/BoxList/BoxList"
import TaskBox from "../TaskBox/TaskBox"
import TaskForm from "../TaskForm/TaskForm"
import { OwnDash } from "../../../App/OwnDash";

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
      id: "",
      name: "Search results",
      sort: false
    })
    view.ref("left").appendChild(this.boxList.el)

    this.taskForm = this.dash.create(TaskForm)
    view.ref("right").appendChild(this.taskForm.el)

    this.dash.listenTo("taskBoxSelected", task => {
      this.taskForm.task = task
      this.taskForm.show()
    })
  }

  activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el).setTitle("Search tasks")
  }

  deactivate() {
  }

  private async onSearch(ev: KeyboardEvent) {
    if (ev.key !== "Enter")
      return

    let query = this.inputEl.value.trim()

    if (query.length !== 0) {
      this.boxList.clear()
      this.taskForm.task = undefined
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
