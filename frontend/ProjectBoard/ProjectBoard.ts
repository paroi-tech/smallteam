import * as $ from "jquery"
import { Dash, Bkb, Component } from "bkb"
import StepsPanel from "../StepsPanel/StepsPanel"
import TaskPanel from "../TaskPanel/TaskPanel"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"
import { Model, ProjectModel, TaskModel } from "../Model/Model"
import ProjectStepsPanel from "../ProjectForm/ProjectStepsPanel/ProjectStepsPanel"
import { MenuItem, MenuEvent } from "../Menu/Menu"
import { DropdownMenu } from "../DropdownMenu/DropdownMenu"

const template = require("html-loader!./projectboard.html")

const menuItems = [
  { id: "editProject", label: "Edit project", eventName: "editProject" },
  { id: "showOnHoldTasks", label: "Show on hold tasks", eventName: "showOnHoldTasks" },
  { id: "showArchivedTasks", label: "Show archived tasks", eventName: "showArchivedTasks" }
]

/**
 * ProjectBoard component.
 *
 * It can contain several steps panels (one for each project task with children) and
 * a side pane to edit information about a task.
 */
export default class ProjectBoard implements Panel {
  readonly el: HTMLElement

  private dropdownMenuContainerEl: HTMLElement
  private stepsPanelContainerEl: HTMLElement
  private taskPanelContainerEl: HTMLElement

  private model: Model

  private taskPanel: TaskPanel
  private dropdownMenu: Component<DropdownMenu>
  private stepsPanelMap: Map<String, StepsPanel> = new Map()

  /**
   * Create a new project board.
   *
   * @param dash - the current application dash.
   * @param project - the project for which the project board is created.
   */
  constructor(private dash: Dash<App>, readonly project: ProjectModel) {
    this.model = this.dash.app.model
    this.el = this.initElements()
    this.initComponents()
    this.listenToChildren()
  }

  /**
   * Create JQuery objects from the component template.
   */
  private initElements() {
    let $container = $(template)
    $container.find("span.js-title").text(this.project.name)
    this.dropdownMenuContainerEl = $container.find(".js-dropdown-menu-container").get(0)
    this.stepsPanelContainerEl = $container.find(".js-stepspanel-container").get(0)
    this.taskPanelContainerEl = $container.find(".js-editpanel-container").get(0)
    return $container.get(0)
  }

  /**
   * Listen to event from child components.
   */
  private listenToChildren() {
    this.dash.listenToChildren<TaskModel>("taskBoxSelected", { deep: true }).call("dataFirst", task => {
      this.taskPanel.fillWith(task)
    })
    this.dropdownMenu.bkb.on("editProject", "eventOnly", ev => {
      this.dash.emit("editProject", this.project)
    })
    this.dash.listenToChildren<TaskModel>("showStepsPanel", { deep: true }).call("dataFirst", task => {
      if (task.id === this.project.rootTaskId) // The rootTask panel is always displayed.
        return
      this.showStepsPanel(task)
    })
  }

  /**
   * Create ProjectBoard inner components, i.e. a TaskPanel and StepsPanels.
   */
  private initComponents() {
    this.dropdownMenu = this.dash.create(DropdownMenu, {
      args: ["ProjectBoardDropdownMenu", "ProjectBoard dropdown menu", "left"]
    })
    this.dropdownMenuContainerEl.appendChild(this.dropdownMenu.el)
    this.dropdownMenu.addItems(menuItems)

    this.taskPanel = this.dash.create(TaskPanel)
    this.taskPanelContainerEl.appendChild(this.taskPanel.el)

    let rootTaskPanel = this.createStepsPanel(this.project.rootTask)
    this.stepsPanelContainerEl.appendChild(rootTaskPanel.el)
    this.createStepsPanelsForChildren(this.project.rootTask)
  }

  /**
   * Listen to model events.
   */
  private listenToModel() {
    // When a new task is created and its parent is the project main task, we have to add a new
    // StepsPanel to the project board.
    // FIXME: this is no longer useful.
    // this.model.on("createTask", "dataFirst", data => {
    //   let task = data.model as TaskModel
    //   if (task.projectId == this.project.id && task.parentTaskId == this.project.rootTaskId) {
    //     this.createStepsPanel(task)
    //   }
    // })
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
      this.stepsPanelContainerEl.appendChild(panel.el)
      this.createStepsPanelsForChildren(task)
    })
  }

  /**
   * Utility function to create a StepsPanel for a task.
   * The panel is appended to the ProjectBoard, but a reference is kept in the stepsPanelMap.
   * @param task - the task that the panel will be created for.
   */
  private createStepsPanel(task: TaskModel): StepsPanel {
    let panel = this.dash.create(StepsPanel, {
      args: [ task ]
    })
    this.stepsPanelMap.set(task.id, panel)
    return panel
  }

  /**
   * Display the StepsPanel of a given task.
   * If there were no StepsPanel for the task, a new StepsPanel is created.
   * @param task
   */
  private showStepsPanel(task: TaskModel) {
    let panel = this.stepsPanelMap.get(task.id)
    if (panel) {
      panel.setVisible(true)
      return
    }
    // The task does not have a panel. We have to create a new one. But before that, we have to eliminate
    // all errors that can prevent the insertion of the panel in the DOM.
    let parentTask = task.parent
    if (!parentTask || !parentTask.children)
      throw new Error(`Task without a parent or invalid parent: task ${task} parent: ${parentTask}`)
    let parentPanel = this.stepsPanelMap.get(parentTask.id)
    if (!parentPanel)
      throw new Error(`Unable to find StepsPanel with ID ${parentTask.id} in ProjectBoard ${this.project.id}`)
    // We find the task that just come before the current task and which StepsPanel is dislayed.
    // First we retrieve the index of the current task in its parent children array.
    let currentTaskIndex = parentTask.children.findIndex(t => t.id === task.id)
    if (currentTaskIndex < 0)
      throw new Error(`Unable to find task in its parent children: task: ${task} parent: ${parentTask}`)
    let precedingPanel: StepsPanel | undefined = undefined
    for (let t of parentTask.children.slice(0, currentTaskIndex)) {
      precedingPanel = this.stepsPanelMap.get(t.id)
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
    let parentNode = this.stepsPanelContainerEl
    let referenceNode = precedingPanel ? precedingPanel.el : parentPanel.el
    parentNode.insertBefore(panel.el, referenceNode.nextSibling)
  }

  /**
   * Hide the ProjectBoard.
   */
  public hide() {
    this.el.style.display = "none";
  }

  /**
   * Make the ProjectBoard visible.
   */
  public show() {
    this.el.style.display = "block";
  }
}
