import { Dash } from "bkb"
import App from "../../../App/App"
import { render } from "monkberry"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import { Model, UpdateModelEvent, TaskModel } from "../../../AppModel/AppModel"
import BoxList from "../../../generics/BoxList/BoxList"
import TaskBox from "../TaskBox/TaskBox"
import TaskForm from "../TaskForm/TaskForm"

const template = require("./SearchWorkspace.monk")

export default class SearchWorkspace implements Workspace {
  readonly el: HTMLElement
  private inputEl: HTMLInputElement

  private view: MonkberryView

  private boxList: BoxList<TaskBox>
  private taskForm: TaskForm

  private model: Model

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.inputEl = this.el.querySelector(".js-input") as HTMLInputElement
    this.inputEl.addEventListener("keypress", ev => this.onSearch(ev))

    let leftEl = this.el.querySelector(".js-left") as HTMLElement
    this.boxList = this.dash.create(BoxList, {
      id: "",
      name: "Search results",
      sort: false
    })
    leftEl.appendChild(this.boxList.el)

    let rightEl = this.el.querySelector(".js-right") as HTMLElement
    this.taskForm = this.dash.create(TaskForm)
    rightEl.appendChild(this.taskForm.el)
  }

  public activate(ctrl: ViewerController) {
    ctrl.setContentEl(this.el).setTitle("Search tasks")
  }

  public deactivate() {
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
      this.dash.listenToChildren("taskBoxSelected").onData(task => {
        this.taskForm.task = task
        this.taskForm.show()
      })
    }
  }
}
