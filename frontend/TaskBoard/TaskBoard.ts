import * as $ from "jquery"
import { Dash } from "bkb"
import App from "../App/App"
import StepSwitcher from "../StepSwitcher/StepSwitcher"
import TaskForm from "../TaskForm/TaskForm"
import { Model, TaskModel, ProjectModel } from "../AppModel/AppModel"
import { UpdateModelEvent } from "../AppModel/ModelEngine"

const template  = require("html-loader!./taskboard.html")

export default class TaskBoard {
  readonly el: HTMLElement
  private leftEl: HTMLElement
  private rightEl: HTMLElement

  private taskForm: TaskForm
  private stepSwitcherMap: Map<String, StepSwitcher> = new Map()

  private model: Model

  constructor(private dash: Dash<App>, readonly rootTask: TaskModel) {
    this.model = this.dash.app.model
    this.el = this.createHtmlElements()
    this.createChildComponents()
    this.listenToChildren()
    this.listenToModel()
  }

  /**
   * Create component content from template.
   */
  private createHtmlElements(): HTMLElement {
    let $container = $(template)
    this.leftEl = $container.find(".js-left").get(0)
    this.rightEl = $container.find(".js-right").get(0)
    return $container.get(0)
  }

  /**
   * Create TaskBoard inner components, i.e. a TaskForm and StepSwitchers.
   */
  private createChildComponents() {
    this.taskForm = this.dash.create(TaskForm)
    this.rightEl.appendChild(this.taskForm.el)

    let rootTaskStepSwitcher = this.createStepSwitcher(this.rootTask)
    this.leftEl.appendChild(rootTaskStepSwitcher.el)
    this.createStepSwitchersForChildren(this.rootTask)
  }

  /**
   * Listen to event from child components.
   *
   * Handled events are:
   *  - TaskBox selection
   *  - StepSwitcher display request
   */
  private listenToChildren() {
    this.dash.listenToChildren<TaskModel>("taskBoxSelected", { deep: true })
      .onData(task => {
        this.taskForm.setTask(task)
      })

    this.dash.listenToChildren<TaskModel>("showStepSwitcher", { deep: true })
      .onData(task => {
        if (task.id === this.rootTask.id) // The rootTask panel is always displayed.
          return
        this.showStepSwitcher(task)
      })
  }

  /**
   * Listen to model events.
   *
   * Handled event are:
   *  - Task deletion
   */
  private listenToModel() {
    // Task deletion. We check if there is a StepSwitcher created for the task and remove it.
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteTask").onData(data => {
      let taskId = data.id as string
      let panel = this.stepSwitcherMap.get(taskId)
      if (!panel)
        return
      this.leftEl.removeChild(panel.el)
      this.stepSwitcherMap.delete(taskId)
    })
  }

  /**
   * Utility function to create a StepSwitcher for a task.
   *
   * @param task - the task that the panel will be created for.
   */
  private createStepSwitcher(task: TaskModel): StepSwitcher {
    let stepSwitcher = this.dash.create(StepSwitcher, task)
    this.stepSwitcherMap.set(task.id, stepSwitcher)
    return stepSwitcher
  }

  /**
   * Recursively create StepSwitchers for the children and descendants of a given task.
   *
   * @param parentTask
   */
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

  /**
   * Display the StepSwitcher of a given task.
   *
   * If there were no StepSwitcher for the task, a new one is created.
   *
   * @param task
   */
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
    console.log("parent children: length", parentTask.children.length, parentTask.children)
    let currentTaskIndex = parentTask.children.findIndex(t => {
      console.log(`comparing ${t.id}:${t.label} to ${task.id}:${task.label}`)
      return t.id === task.id
    })
    if (currentTaskIndex < 0)
      throw new Error(`Unable to find task in its parent children: task: ${task.label} parent: ${parentTask.label} `)
    let precedingStepSwitcher: StepSwitcher | undefined = undefined
    for (let t of parentTask.children.slice(0, currentTaskIndex)) {
      precedingStepSwitcher = this.stepSwitcherMap.get(t.id)
      if (precedingStepSwitcher !== undefined)
        break
    }
    // IMPORTANT: it is better to create the new StepSwitcher here, after that errors than can prevent
    // the insertion of the panel in the DOM are eliminated. That prevents two bugs:
    //  1.  When we would want to display the panel again, we would find it in stepSwitcherMap, but
    //      there is no corresponding HTML node in the DOM. So even if we try to display, th panel
    //      nothing won't be displayed.
    //      will appea
    //  2.  What will happen if we want to display a child of the current task as StesPanel?
    //      In that case, the parent StepSwitcher would exist in the 'stepSwitcherMap', but not in the DOM,
    //      which means that parent.nextSibling will be 'null' and the new node will be added at the end
    //      of the Project, which is not its correct place.
    stepSwitcher = this.createStepSwitcher(task)
    // We insert the new StepSwitcher in the DOM. See the discussion for details about the method used:
    // https://stackoverflow.com/questions/4793604/how-to-do-insert-after-in-javascript-without-using-a-library
    let parentNode = this.leftEl
    let referenceNode = precedingStepSwitcher ? precedingStepSwitcher.el : parentStepSwitcher.el
    parentNode.insertBefore(stepSwitcher.el, referenceNode.nextSibling)
  }

  /**
   * Hide the component.
   */
  public hide() {
    this.el.style.display = "none"
  }

  /**
   * Make the component visible.
   */
  public show() {
    this.el.style.display = "block"
  }
}
