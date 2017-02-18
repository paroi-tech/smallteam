import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import StepsPanel from "../StepsPanel/StepsPanel"
import TaskPanel from "../TaskPanel/TaskPanel"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"
import { ProjectModel, TaskModel } from "../Model/Model"

const template = require("html-loader!./projectboard.html")

/**
 * ProjectBoard component.
 *
 * It can contain several steps panels (one for each project task with children) and
 * a side pane to edit information about a task.
 */
export default class ProjectBoard implements Panel {
  private $container: JQuery
  private $stepsPanelContainer: JQuery
  private $editPanelContainer: JQuery

  private taskPanel: TaskPanel
  private stepsPanelMap: Map<String, StepsPanel>

  /**
   * Create a new project board.
   *
   * @param dash - the current application dash.
   * @param project - the project for which the project board is created.
   */
  constructor(private dash: Dash<App>, private project: ProjectModel) {
    this.initJQueryObjects()
    this.initComponents()
    this.dash.listenToChildren<TaskModel>("taskBoxSelected", { deep: true }).call("dataFirst", task => {
      console.log(`TaskBox ${task.id} selected in projectboard ${this.project.id}`)
        this.taskPanel.fillWith(task)
    })
  }

  /**
   * Create JQuery objects from the component template.
   */
  private initJQueryObjects() {
    this.$container = $(template)
    this.$container.find(".js-title").text(this.project.name)
    this.$stepsPanelContainer = this.$container.find(".js-stepspanel-container")
    this.$editPanelContainer = this.$container.find(".js-editpanel-container")
  }

  /**
   * Create ProjectBoard inner components, i.e. a TaskPanel and StepsPanels.
   */
  private initComponents() {
    this.taskPanel = this.dash.create(TaskPanel, {
      args: [ "Task panel" ]
    })
    this.taskPanel.attachTo(this.$editPanelContainer[0])

    this.createStepsPanel(this.project.rootTask)
    if (this.project.tasks) {
      let tasksWithChildren = this.project.tasks.filter((task: TaskModel) => {
        return task.children && task.children.length > 0
      })
      for (let task of tasksWithChildren)
        this.createStepsPanel(task)
    }
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
    panel.attachTo(this.$stepsPanelContainer[0])
  }

  public hide() {
    this.$container.hide();
  }

  public show() {
    this.$container.show();
  }
}
