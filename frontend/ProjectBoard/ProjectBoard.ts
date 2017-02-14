import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import StepsPanel from "../StepsPanel/StepsPanel"
import EditPanel  from "../EditPanel/EditPanel"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"
import { ProjectModel, TaskModel } from "../Model/Model"

const template = require("html-loader!./projectboard.html")

export default class ProjectBoard implements Panel {
  private $container: JQuery
  private $stepsPanelContainer: JQuery
  private $editPanelContainer: JQuery

  private editPanel: EditPanel
  private stepsPanelMap: Map<String, StepsPanel>

  constructor(private dash: Dash<App>, private projectModel: ProjectModel) {
    this.$container = $(template)
    this.$stepsPanelContainer = this.$container.find(".js-stepspanel-container")
    this.$editPanelContainer = this.$container.find(".js-editpanel-container")
    this.$container.find(".js-title").text(projectModel.name)

    this.initComponents()
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  private createStepsPanel(taskModel: TaskModel) {
    let panel = this.dash.create(StepsPanel, {
      args: [
        taskModel
      ]
    })
    panel.attachTo(this.$stepsPanelContainer[0])
  }

  private initComponents() {
    this.editPanel = this.dash.create(EditPanel, {
      args: [ "Edit panel" ]
    })
    this.editPanel.attachTo(this.$editPanelContainer[0])

    this.createStepsPanel(this.projectModel.rootTask)
    let tasks = this.projectModel.tasks!.filter((m: TaskModel) => {
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