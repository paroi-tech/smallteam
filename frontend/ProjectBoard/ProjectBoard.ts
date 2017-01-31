import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import StepsPanel from "../StepsPanel/StepsPanel"
import EditPanel  from "../EditPanel/EditPanel"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"
import { ProjectModel } from "../Model/FragmentsModel"

const template = require("html-loader!./projectboard.html")

export default class ProjectBoard implements Component, Panel {
  static readonly componentName = "ProjectBoard"
  readonly bkb: Bkb

  private $container: JQuery
  private $stepsPanelContainer: JQuery
  private $editPanelContainer: JQuery

  private editPanel: EditPanel
  private stepsPanel: StepsPanel

  constructor(private dash: Dash<App>, private projectModel: ProjectModel) {
    this.$container = $(template)
    this.$stepsPanelContainer = this.$container.find(".js-stepspanel-container")
    this.$editPanelContainer = this.$container.find(".js-editpanel-container")
    this.$container.find(".js-title").text(projectModel.name)
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public hide() {
    this.$container.hide();
  }

  public init(): ProjectBoard {
    this.editPanel = this.dash.create(EditPanel, { args: [ "Edit panel" ] }).init()
    this.editPanel.attachTo(this.$editPanelContainer[0])

    this.stepsPanel = this.dash.create(StepsPanel, { args: [ this.projectModel ] }).init()
    this.stepsPanel.attachTo(this.$stepsPanelContainer[0])

    return this;
  }

  public show() {
    this.$container.show();
  }
}