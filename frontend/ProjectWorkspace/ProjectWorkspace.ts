import * as $ from "jquery"
import { Dash, Bkb, Component } from "bkb"
import StepSwitcher from "../StepSwitcher/StepSwitcher"
import TaskForm from "../TaskForm/TaskForm"
import App from "../App/App"
import { Panel } from "../WorkspaceViewer/WorkspaceViewer"
import { Model, ProjectModel, TaskModel } from "../Model/Model"
import { MenuItem } from "../Menu/Menu"
import { DropdownMenu } from "../DropdownMenu/DropdownMenu"

const template = require("html-loader!./projectworkspace.html")

const menuItems = [
  {
    id: "editProject",
    label: "Edit project",
    eventName: "editProject",
    data: undefined
  },
  {
    id: "showOnHoldTasks",
    label: "Show on hold tasks",
    eventName: "showOnHoldTasks",
    data: undefined
  },
  {
    id: "showArchivedTasks",
    label: "Show archived tasks",
    eventName: "showArchivedTasks",
    data: undefined
  },
  {
    id: "deleteProject",
    label: "Delete project",
    eventName: "deleteProject",
    data: undefined
  }
]

/**
 * ProjectWorkspace component.
 *
 * It can contain several step switchers (one for each project task with children) and
 * a side pane that contain a TaskForm.
 */
export default class ProjectWorkspace implements Panel {
  readonly el: HTMLElement

  private dropdownMenuContainerEl: HTMLElement
  private stepSwitcherContainerEl: HTMLElement
  private taskFormContainerEl: HTMLElement

  private model: Model

  private taskForm: TaskForm
  private dropdownMenu: Component<DropdownMenu>
  private stepSwitcherMap: Map<String, StepSwitcher> = new Map()

  /**
   * Create a new project board.
   *
   * @param dash - the current application dash.
   * @param project - the project for which the project board is created.
   */
  constructor(private dash: Dash<App>, readonly project: ProjectModel) {
    this.model = this.dash.app.model
    this.el = this.createHtmlElements()
    this.createChildComponents()
    this.listenToChildren()
    this.listenToModel()
  }

  /**
   * Create component content from template.
   */
  private createHtmlElements() {
    let $container = $(template)
    $container.find("span.js-title").text(this.project.name)
    this.dropdownMenuContainerEl = $container.find(".js-dropdown-menu-container").get(0)
    this.stepSwitcherContainerEl = $container.find(".js-stepswitcher-container").get(0)
    this.taskFormContainerEl = $container.find(".js-taskform-container").get(0)
    return $("<div></div>").append($container).get(0)
  }

  /**
   * Listen to event from child components.
   *
   * Handled events are:
   *  - TaskBox selection
   *  - Menu edition request
   *  - StepSwitcher display request
   *  - Project deletion request
   */
  private listenToChildren() {
    this.dash.listenToChildren<TaskModel>("taskBoxSelected", { deep: true })
      .call("dataFirst", task => {
        this.taskForm.setTask(task)
      })

    this.dropdownMenu.bkb.on("editProject", "eventOnly", ev => {
      this.dash.emit("editProject", this.project)
    })

    this.dash.listenToChildren<TaskModel>("showStepSwitcher", { deep: true })
      .call("dataFirst", task => {
        if (task.id === this.project.rootTaskId) // The rootTask panel is always displayed.
          return
        this.showStepSwitcher(task)
      })

    this.dropdownMenu.bkb.on("deleteProject", "eventOnly", async (ev) => {
      if (this.project.tasks && this.project.tasks.length !== 0) {
        alert("Sorry. The project can not be deleted. It contains tasks.")
        return
      }
      if (!confirm("Are you sure you want to delete this project"))
        return
      try {
        await this.model.exec("delete", "Project", { id: this.project.id })
      } catch (error) {
        alert("Unable to delete project. Try again later.")
      }
    })
  }

  /**
   * Create ProjectWorkspace inner components, i.e. a TaskPanel and StepSwitchers.
   */
  private createChildComponents() {
    this.dropdownMenu = this.dash.create(DropdownMenu, {
      args: ["ProjectWorkspace dropdown menu", "left"]
    })
    this.dropdownMenuContainerEl.appendChild(this.dropdownMenu.el)
    this.dropdownMenu.addItems(menuItems)

    this.taskForm = this.dash.create(TaskForm)
    this.taskFormContainerEl.appendChild(this.taskForm.el)

    let rootTaskPanel = this.createStepSwitcher(this.project.rootTask)
    this.stepSwitcherContainerEl.appendChild(rootTaskPanel.el)
    this.createStepSwitchersForChildren(this.project.rootTask)
  }

  /**
   * Listen to model events.
   *
   * Handled event are:
   *  - Task deletion
   */
  private listenToModel() {
    // Task deletion. We check if there is a StepSwitcher created for the task and remove it.
    this.model.on("change", "dataFirst", data => {
      if (data.type !== "Task" || data.cmd !== "delete")
        return
      let taskId = data.id as string
      let panel = this.stepSwitcherMap.get(taskId)
      if (!panel)
        return
      this.stepSwitcherContainerEl.removeChild(panel.el)
      this.stepSwitcherMap.delete(taskId)
    })
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
      stepSwitcher.setVisible(false)
      this.stepSwitcherContainerEl.appendChild(stepSwitcher.el)
      this.createStepSwitchersForChildren(task)
    })
  }

  /**
   * Utility function to create a StepSwitcher for a task.
   *
   * The StepSwitcher is appended to the ProjectWorkspace, but a reference is kept in the
   * stepSwitcherMap.
   *
   * @param task - the task that the panel will be created for.
   */
  private createStepSwitcher(task: TaskModel): StepSwitcher {
    let stepSwitcher = this.dash.create(StepSwitcher, {
      args: [ task ]
    })
    this.stepSwitcherMap.set(task.id, stepSwitcher)
    return stepSwitcher
  }

  /**
   * Display the StepSwitcher of a given task.
   *
   * If there were no StepSwitcher for the task, a new one is created.
   *
   * @param task
   */
  private showStepSwitcher(task: TaskModel) {
    let panel = this.stepSwitcherMap.get(task.id)
    if (panel) {
      panel.setVisible(true)
      return
    }
    // The task does not have a StepSwitcher. We have to create a new one. But before that,
    // we have to discard all errors that can prevent the insertion of the panel in the DOM.
    let parentTask = task.parent
    if (!parentTask || !parentTask.children)
      throw new Error(`Task without a parent or invalid parent: task ${task} parent: ${parentTask}`)
    let parentStepSwitcher = this.stepSwitcherMap.get(parentTask.id)
    if (!parentStepSwitcher)
      throw new Error(`Unable to find StepSwitcher with ID ${parentTask.id} in ProjectWorkspace ${this.project.id}`)
    // We find the task that just come before the current task and which StepSwitcher is displayed.
    // First we retrieve the index of the current task in its parent children array.
    let currentTaskIndex = parentTask.children.findIndex(t => t.id === task.id)
    if (currentTaskIndex < 0)
      throw new Error(`Unable to find task in its parent children: task: ${task} parent: ${parentTask}`)
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
    panel = this.createStepSwitcher(task)
    // We insert the new StepSwitcher in the DOM. See the discussion for details about the method used:
    // https://stackoverflow.com/questions/4793604/how-to-do-insert-after-in-javascript-without-using-a-library
    let parentNode = this.stepSwitcherContainerEl
    let referenceNode = precedingStepSwitcher ? precedingStepSwitcher.el : parentStepSwitcher.el
    parentNode.insertBefore(panel.el, referenceNode.nextSibling)
  }

  /**
   * Hide the ProjectWorkspace.
   */
  public hide() {
    this.el.style.display = "none";
  }

  /**
   * Make the ProjectWorkspace visible.
   */
  public show() {
    this.el.style.display = "block";
  }
}
