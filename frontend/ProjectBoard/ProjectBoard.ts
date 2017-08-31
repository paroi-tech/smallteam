import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
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
  private $container: JQuery
  private $dropdownMenuContainer: JQuery
  private $stepsPanelContainer: JQuery
  private $taskPanelContainer: JQuery

  private model: Model

  private taskPanel: TaskPanel
  private dropdownMenu: DropdownMenu
  private stepsPanelMap: Map<String, StepsPanel>

  /**
   * Create a new project board.
   *
   * @param dash - the current application dash.
   * @param project - the project for which the project board is created.
   */
  constructor(private dash: Dash<App>, readonly project: ProjectModel) {
    this.model = this.dash.app.model
    this.initJQueryObjects()
    this.initComponents()
    this.listenToChildren()
  }

  /**
   * Create JQuery objects from the component template.
   */
  private initJQueryObjects() {
    this.$container = $(template)
    this.$container.find("span.js-title").text(this.project.name)
    this.$dropdownMenuContainer = this.$container.find(".js-dropdown-menu-container")
    this.$stepsPanelContainer = this.$container.find(".js-stepspanel-container")
    this.$taskPanelContainer = this.$container.find(".js-editpanel-container")
  }

  /**
   * Listen to event from child componants.
   */
  private listenToChildren() {
    this.dash.listenToChildren<TaskModel>("taskBoxSelected", { deep: true }).call("dataFirst", task => {
      this.taskPanel.fillWith(task)
    })
    this.dropdownMenu.bkb.on("editProject", "eventOnly", ev => {
      this.dash.emit("editProject", this.project)
    })
  }

  /**
   * Create ProjectBoard inner components, i.e. a TaskPanel and StepsPanels.
   */
  private initComponents() {
    this.dropdownMenu = this.dash.create(DropdownMenu, {
      args: ["ProjectBoardDropdownMenu", "ProjectBoard dropdown menu", "left"]
    })
    this.dropdownMenu.addItems(menuItems)
    this.dropdownMenu.attachTo(this.$dropdownMenuContainer.get(0))

    this.taskPanel = this.dash.create(TaskPanel, {
      args: [ "Task panel" ]
    })
    this.taskPanel.attachTo(this.$taskPanelContainer.get(0))

    this.createStepsPanel(this.project.rootTask)
    if (this.project.tasks) {
      let tasksWithChildren = this.project.tasks.filter(task => task.children != undefined)
      for (let task of tasksWithChildren)
        this.createStepsPanel(task)
    }
  }

  /**
   * Listen to model events.
   * We handle the following events:
   *  - Task creation
   */
  private listenToModel() {
    // When a new task is created and its parent is the project main task, we have to add a new StepsPanel
    // to the project board.
    this.model.on("createTask", "dataFirst", data => {
      let task = data.model as TaskModel
      if (task.projectId == this.project.id && task.parentTaskId == this.project.rootTaskId) {
        this.createStepsPanel(task)
      }
    })
  }

  /**
   * Add the project board to a container.
   *
   * @param el - element that the project board will be added to.
   */
  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  /**
   * Create a StepsPanel for a task.
   *
   * @param task - the task that the panel will be created for.
   */
  private createStepsPanel(task: TaskModel) {
    let panel = this.dash.create(StepsPanel, {
      args: [ task ]
    })
    panel.attachTo(this.$stepsPanelContainer.get(0))
  }

  /**
   * Hide the ProjectBoard.
   */
  public hide() {
    this.$container.hide();
  }

  /**
   * Make the ProjectBoard visible.
   */
  public show() {
    this.$container.show();
  }
}
