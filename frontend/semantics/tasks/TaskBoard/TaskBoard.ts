import { Log } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import TaskForm from "../TaskForm/TaskForm"
import StepSwitcher from "../../steps/StepSwitcher/StepSwitcher"
import { Model, TaskModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash"

const template = require("./TaskBoard.monk")

export default class TaskBoard {
  readonly el: HTMLElement
  private leftEl: HTMLElement

  private taskForm: TaskForm
  private stepSwitcherMap = new Map<String, StepSwitcher>()

  private model: Model
  private log: Log

  constructor(private dash: OwnDash, readonly rootTask: TaskModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    let view = render(template)
    this.el = view.rootEl()
    this.leftEl = view.ref("left")

    this.taskForm = this.dash.create(TaskForm)
    view.ref("right").appendChild(this.taskForm.el)

    let rootTaskStepSwitcher = this.createStepSwitcher(this.rootTask)
    this.leftEl.appendChild(rootTaskStepSwitcher.el)
    this.createStepSwitchersForChildren(this.rootTask)

    this.dash.listenTo<TaskModel>("taskBoxSelected", task => this.taskForm.task = task)
    this.dash.listenTo<TaskModel>("showStepSwitcher", task => {
      if (task.id === this.rootTask.id) // The rootTask panel is always displayed.
        return
      this.showStepSwitcher(task)
    })
    // Task deletion. We check if there is a StepSwitcher created for the task and remove it.
    this.dash.listenToModel("deleteTask", data => {
      let taskId = data.id as string
      let panel = this.stepSwitcherMap.get(taskId)

      if (!panel)
        return
      this.leftEl.removeChild(panel.el)
      this.stepSwitcherMap.delete(taskId)
    })
  }

  public hide() {
    this.el.style.display = "none"
  }

  public show() {
    this.el.style.display = "block"
  }

  private createStepSwitcher(task: TaskModel): StepSwitcher {
    let stepSwitcher = this.dash.create(StepSwitcher, task)
    this.stepSwitcherMap.set(task.id, stepSwitcher)

    return stepSwitcher
  }

  private createStepSwitchersForChildren(parentTask: TaskModel) {
    if (!parentTask.children || parentTask.children.length === 0)
      return
    parentTask.children.filter(t => t.children && t.children.length !== 0).forEach(task => {
      let stepSwitcher = this.createStepSwitcher(task)
      // The StepSwitchers created for child tasks are hidden by default.
      this.leftEl.appendChild(stepSwitcher.el)
      this.createStepSwitchersForChildren(task)
    })
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
      throw new Error(`Unable to find task in its parent children: task: ${task.label} parent: ${parentTask.label} `)

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
     * 2. What will happen if we want to display a child of the current task as StesPanel?
     *    In that case, the parent StepSwitcher would exist in the 'stepSwitcherMap', but not in the DOM,
     *    which means that parent.nextSibling would be 'null' and the new node will be added at the end
     *    of the TaskBoard, which is not its correct place.
     */
    stepSwitcher = this.createStepSwitcher(task)

    let parentNode = this.leftEl
    let referenceNode = precedingStepSwitcher ? precedingStepSwitcher.el : parentStepSwitcher.el
    parentNode.insertBefore(stepSwitcher.el, referenceNode.nextSibling)
  }
}
