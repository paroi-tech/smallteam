import { render } from "@fabtom/lt-monkberry"
import TaskForm from "../TaskForm/TaskForm"
import StepSwitcher from "../../steps/StepSwitcher/StepSwitcher"
import { TaskModel } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash"
import { DropdownMenu } from "../../../generics/DropdownMenu/DropdownMenu";

const template = require("./TaskBoard.monk")

export interface TaskBoardOptions {
  rootTask: TaskModel
  dropdownMenu: DropdownMenu
}

export default class TaskBoard {
  readonly el: HTMLElement
  private selEl: HTMLElement

  private taskForm: TaskForm
  private stepSwitcherMap = new Map<String, StepSwitcher>()

  constructor(private dash: OwnDash, private options: TaskBoardOptions) {
    let view = render(template)

    this.el = view.rootEl()
    this.selEl = view.ref("sel")

    this.taskForm = this.dash.create(TaskForm)
    view.ref("edit").appendChild(this.taskForm.el)

    let rootTaskStepSwitcher = this.createStepSwitcher(options.rootTask, options.dropdownMenu)

    this.selEl.appendChild(rootTaskStepSwitcher.el)
    this.createStepSwitchersForChildren(options.rootTask)

    this.addDashListeners()
    this.addModelListeners()
  }

  hide() {
    this.el.hidden = true
  }

  show() {
    this.el.hidden = false
  }

  private addDashListeners() {
    this.dash.listenTo<TaskModel>("taskBoxSelected", task => this.taskForm.setTask(task))
    this.dash.listenTo<TaskModel>("showStepSwitcher", task => {
      if (task.id === this.options.rootTask.id) // The rootTask panel is always displayed.
        return
      this.showStepSwitcher(task)
    })
  }

  private addModelListeners() {
    // Task deletion. We check if there is a StepSwitcher created for the task and remove it.
    this.dash.listenToModel("deleteTask", data => {
      let taskId = data.id as string
      this.removeStepSwitcherOf(taskId)
    })
    // Task update event. We handle the case when a task is archived or put on hold.
    this.dash.listenToModel("updateTask", data => {
      let task = data.model as TaskModel
      if (!task.currentStep.isSpecial || !this.options.rootTask.children || !this.options.rootTask.children.has(task.id))
        return
      this.removeLineageStepSwitchers(task)
    })
  }

  private removeStepSwitcherOf(taskId: string) {
    let stepSwitcher = this.stepSwitcherMap.get(taskId)

    if (!stepSwitcher)
      return
    this.selEl.removeChild(stepSwitcher.el)
    this.stepSwitcherMap.delete(taskId)
  }

  private createStepSwitcher(parentTask: TaskModel, dropdownMenu?: DropdownMenu): StepSwitcher {
    let stepSwitcher = this.dash.create(StepSwitcher, { parentTask, dropdownMenu })
    this.stepSwitcherMap.set(parentTask.id, stepSwitcher)
    return stepSwitcher
  }

  private createStepSwitchersForChildren(parentTask: TaskModel) {
    if (!parentTask.children || parentTask.children.length === 0)
      return
    parentTask.children.filter(t => t.children && t.children.length !== 0).forEach(task => {
      let stepSwitcher = this.createStepSwitcher(task)
      // The StepSwitchers created for child tasks are hidden by default.
      this.selEl.appendChild(stepSwitcher.el)
      this.createStepSwitchersForChildren(task)
    })
  }

  /**
   * Remove of the StepSwitchers of a task and its children using depth-first search.
   * @param task
   */
  private removeLineageStepSwitchers(task: TaskModel) {
    let children = task.children || [] as TaskModel[]
    for (let child of children)
      this.removeLineageStepSwitchers(child)
    this.removeStepSwitcherOf(task.id)
  }

  private showStepSwitcher(task: TaskModel) {
    let stepSwitcher = this.stepSwitcherMap.get(task.id)
    if (stepSwitcher) {
      stepSwitcher.setVisible(true)
      return
    }

    // The task does not have a StepSwitcher. We have to create a new one. But before that,
    // we have to discard all errors that can prevent the insertion of the panel in the DOM.
    let parentTask = task.parent
    if (!parentTask || !parentTask.children)
      throw new Error(`Task without a parent or invalid parent: task ${task} parent: ${parentTask}`)

    let parentStepSwitcher = this.stepSwitcherMap.get(parentTask.id)
    if (!parentStepSwitcher)
      throw new Error(`Unable to find StepSwitcher with ID ${parentTask.id} in TaskBoard`)

    // We find the task that just come before the current task and which StepSwitcher is displayed.
    // First we retrieve the index of the current task in its parent children array.
    let currentTaskIndex = parentTask.children.findIndex(t => t.id === task.id)
    if (currentTaskIndex < 0)
      throw new Error(`Unable to find task in its parent children: task: ${task.label} parent: ${parentTask.label}`)

    let precedingStepSwitcher: StepSwitcher | undefined = undefined
    for (let t of parentTask.children.slice(0, currentTaskIndex)) {
      precedingStepSwitcher = this.stepSwitcherMap.get(t.id)
      if (precedingStepSwitcher !== undefined)
        break
    }

    /**
     * It is better to create the new StepSwitcher here, after errors than can prevent
     * the insertion of the panel in the DOM are eliminated. That prevents two bugs:
     * 1. When we would want to display the panel again, we would find it in stepSwitcherMap, but
     *    there is no corresponding HTML node in the DOM. So even if we try to display the panel
     *    nothing will be displayed.
     * 2. What will happen if we want to display a child of the current task in a StepSwitcher?
     *    In that case, the parent StepSwitcher would exist in the 'stepSwitcherMap', but not in the DOM,
     *    which means that parent.nextSibling would be 'null' and the new node will be added at the end
     *    of the TaskBoard, which is not its correct place.
     */
    stepSwitcher = this.createStepSwitcher(task)
    let parentNode = this.selEl
    let referenceNode = precedingStepSwitcher ? precedingStepSwitcher.el : parentStepSwitcher.el
    parentNode.insertBefore(stepSwitcher.el, referenceNode.nextSibling)
  }
}
