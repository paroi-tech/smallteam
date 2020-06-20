import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { Model, TaskModel } from "../../AppModel/AppModel"
import BoxList from "../../generics/BoxList"
import { ViewerController, Workspace } from "../../generics/WorkspaceViewer"
import TaskBox from "./TaskBox"
import TaskForm from "./TaskForm"

// tslint:disable-next-line: no-unused-expression
scss`
@import "../shared-ui/theme/definitions";

.SearchWorkspace {
  margin: 10px auto;

  &-header {
    font-size: $f32;
    text-align: center;
  }

  &-searchDiv {
    margin-bottom: 10px;
    padding: 5px;
    text-align: right;
  }

  &-searchInput {
    border: 1px solid darkgrey;
    padding: 3px;
  }

  &-body {
    display: flex;
    justify-content: space-around;
  }
}
`

const template = handledom`
<div class="SearchWorkspace">
  <div class="SearchWorkspace-searchDiv">
    <input type="text" placeholder="Search tasks" class="SearchWorkspace-searchInput" h="input">
  </div>
  <div class="SearchWorkspace-body">
    <div class="SearchWorkspace-bodyLeft" h="left"></div>
    <div class="SearchWorkspace-bodyRight" h="right"></div>
  </div>
</div>
`

export default class SearchWorkspace implements Workspace {
  readonly el: HTMLElement
  private inputEl: HTMLInputElement

  private boxList: BoxList<TaskBox>
  private taskForm: TaskForm

  private model: Model

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    const { root, ref } = template()

    this.el = root
    this.inputEl = ref("input")
    this.inputEl.addEventListener("keypress", ev => this.onSearch(ev))

    this.boxList = this.dash.create(BoxList, {
      title: "Search results"
    })
    ref("left").appendChild(this.boxList.el)

    this.taskForm = this.dash.create(TaskForm)
    ref("right").appendChild(this.taskForm.el)

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
