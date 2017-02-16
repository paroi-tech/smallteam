import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import StepsPanel from "../StepsPanel/StepsPanel"
import TaskPanel from "../TaskPanel/TaskPanel"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"
import { ProjectModel, TaskModel } from "../Model/Model"

const template = require("html-loader!./projectboard.html")

export default class ProjectBoard implements Panel {
  private $container: JQuery
  private $stepsPanelContainer: JQuery
  private $editPanelContainer: JQuery

  private taskPanel: TaskPanel
  private stepsPanelMap: Map<String, StepsPanel>

  constructor(private dash: Dash<App>, private project: ProjectModel) {
    this.$container = $(template)
    this.$stepsPanelContainer = this.$container.find(".js-stepspanel-container")
    this.$editPanelContainer = this.$container.find(".js-editpanel-container")
    this.$container.find(".js-title").text(project.name)

    this.initComponents()
    this.dash.listenToChildren<TaskModel>("taskBoxSelected", { deep: true }).call("dataFirst", data => {
      console.log(`TaskBox ${data.id} selected in projectboard ${this.project.id}`)
        this.taskPanel.fillWith(data as TaskModel)
    })

  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  private createStepsPanel(taskModel: TaskModel) {
    let panel = this.dash.create(StepsPanel, {
      args: [ taskModel ]
    })
    panel.attachTo(this.$stepsPanelContainer[0])
  }

  private initComponents() {
    this.taskPanel = this.dash.create(TaskPanel, {
      args: [ "Task panel" ]
    })
    this.taskPanel.attachTo(this.$editPanelContainer[0])

    this.createStepsPanel(this.project.rootTask)
    let tasks = this.project.tasks!.filter((m: TaskModel) => {
      return (m.children && m.children.length > 0)
    })
    for (let task of tasks)
      this.createStepsPanel(task)
  }

  public hide() {
    this.$container.hide();
  }

  public show() {
    this.$container.show();
  }
}