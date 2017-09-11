import * as $ from "jquery"
import { Dash, Bkb, Component } from "bkb"
import TaskProgression from "../TaskProgression/TaskProgression"
import TaskForm from "../TaskForm/TaskForm"
import App from "../App/App"
import { Panel } from "../WorkspaceViewer/WorkspaceViewer"
import { Model, ProjectModel, TaskModel } from "../Model/Model"
import ProjectStepsPanel from "../ProjectForm/ProjectStepsPanel/ProjectStepsPanel"
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
 * It can contain several steps panels (one for each project task with children) and
 * a side pane to edit information about a task.
 */
export default class ProjectWorkspace implements Panel {
  readonly el: HTMLElement

  private dropdownMenuContainerEl: HTMLElement
  private taskProgressionContainerEl: HTMLElement
  private taskFormContainerEl: HTMLElement

  private model: Model

  private taskForm: TaskForm
  private dropdownMenu: Component<DropdownMenu>
  private taskProgressionMap: Map<String, TaskProgression> = new Map()

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
    this.taskProgressionContainerEl = $container.find(".js-stepspanel-container").get(0)
    this.taskFormContainerEl = $container.find(".js-editpanel-container").get(0)
    return $("<div></div>").append($container).get(0)
  }

  /**
   * Listen to event from child components.
   *
   * Handled events are:
   *  - TaskBox selection
   *  - Menu edition request
   *  - StepsPanel display request
   *  - Project deletion request
   */
  private listenToChildren() {
    this.dash.listenToChildren<TaskModel>("taskBoxSelected", { deep: true }).call("dataFirst", task => {
      this.taskForm.setTask(task)
    })
    this.dropdownMenu.bkb.on("editProject", "eventOnly", ev => {
      this.dash.emit("editProject", this.project)
    })
    this.dash.listenToChildren<TaskModel>("showStepsPanel", { deep: true }).call("dataFirst", task => {
      if (task.id === this.project.rootTaskId) // The rootTask panel is always displayed.
        return
      this.showTaskProgression(task)
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
   * Create ProjectWorkspace inner components, i.e. a TaskPanel and StepsPanels.
   */
  private createChildComponents() {
    this.dropdownMenu = this.dash.create(DropdownMenu, {
      args: ["ProjectWorkspaceDropdownMenu", "ProjectWorkspace dropdown menu", "left"]
    })
    this.dropdownMenuContainerEl.appendChild(this.dropdownMenu.el)
    this.dropdownMenu.addItems(menuItems)

    this.taskForm = this.dash.create(TaskForm)
    this.taskFormContainerEl.appendChild(this.taskForm.el)

    let rootTaskPanel = this.createStepsPanel(this.project.rootTask)
    this.taskProgressionContainerEl.appendChild(rootTaskPanel.el)
    this.createStepsPanelsForChildren(this.project.rootTask)
  }

  /**
   * Listen to model events.
   *
   * Handled event are:
   *  - Task deletion
   */
  private listenToModel() {
    // Task deletion. We check if there is a StepsPanel created for the task and remove it.
    this.model.on("change", "dataFirst", data => {
      if (data.type !== "Task" || data.cmd !== "delete")
        return
      let taskId = data.id as string
      let panel = this.taskProgressionMap.get(taskId)
      if (!panel)
        return
      this.taskProgressionContainerEl.removeChild(panel.el)
      this.taskProgressionMap.delete(taskId)
    })
  }

  /**
   * Recursively create panels for the children and descendants of a given task.
   * @param parentTask
   */
  private createStepsPanelsForChildren(parentTask: TaskModel) {
    if (!parentTask.children || parentTask.children.length === 0)
      return
    parentTask.children.filter(t => t.children && t.children.length !== 0).forEach(task => {
      let panel = this.createStepsPanel(task)
      // The panel created for child tasks are hidden by default.
      panel.setVisible(false)
      this.taskProgressionContainerEl.appendChild(panel.el)
      this.createStepsPanelsForChildren(task)
    })
  }

  /**
   * Utility function to create a StepsPanel for a task.
   * The panel is appended to the ProjectWorkspace, but a reference is kept in the stepsPanelMap.
   * @param task - the task that the panel will be created for.
   */
  private createStepsPanel(task: TaskModel): TaskProgression {
    let pane = this.dash.create(TaskProgression, {
      args: [ task ]
    })
    this.taskProgressionMap.set(task.id, pane)
    return pane
  }

  /**
   * Display the TaskProgression of a given task.
   *
   * If there were no TaskProgression for the task, a new one is created.
   *
   * @param task
   */
  private showTaskProgression(task: TaskModel) {
    let panel = this.taskProgressionMap.get(task.id)
    if (panel) {
      panel.setVisible(true)
      return
    }
    // The task does not have a panel. We have to create a new one. But before that, we have to eliminate
    // all errors that can prevent the insertion of the panel in the DOM.
    let parentTask = task.parent
    if (!parentTask || !parentTask.children)
      throw new Error(`Task without a parent or invalid parent: task ${task} parent: ${parentTask}`)
    let parentPanel = this.taskProgressionMap.get(parentTask.id)
    if (!parentPanel)
      throw new Error(`Unable to find StepsPanel with ID ${parentTask.id} in ProjectWorkspace ${this.project.id}`)
    // We find the task that just come before the current task and which StepsPanel is dislayed.
    // First we retrieve the index of the current task in its parent children array.
    let currentTaskIndex = parentTask.children.findIndex(t => t.id === task.id)
    if (currentTaskIndex < 0)
      throw new Error(`Unable to find task in its parent children: task: ${task} parent: ${parentTask}`)
    let precedingPanel: TaskProgression | undefined = undefined
    for (let t of parentTask.children.slice(0, currentTaskIndex)) {
      precedingPanel = this.taskProgressionMap.get(t.id)
      if (precedingPanel !== undefined)
        break
    }
    // IMPORTANT: it is better to create the new StepsPanel here, after that errors than can prevent
    // the insertion of the panel in the DOM are eliminated. That prevents two bugs:
    //  1.  When we would want to display the panel again, we would find it in stepsPanelMaps, but
    //      there is no corresponding HTML node in the DOM. So even if we try to display, th panel
    //      nothing won't be displayed.
    //      will appea
    //  2.  What will happen if we want to display a child of the current task as StesPanel?
    //      In that case, the parent StepsPanel would exist in the 'stepsPanelMap', but not in the DOM,
    //      which means that parent.nextSibling will be 'null' and the new node will be added at the end
    //      of the Project, which is not its correct place.
    panel = this.createStepsPanel(task)
    // We insert the new StepsPanel in the DOM. See the discussion for details about the method used:
    // https://stackoverflow.com/questions/4793604/how-to-do-insert-after-in-javascript-without-using-a-library
    let parentNode = this.taskProgressionContainerEl
    let referenceNode = precedingPanel ? precedingPanel.el : parentPanel.el
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
