import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import StepsPanel from "../StepsPanel/StepsPanel"
import EditPanel  from "../EditPanel/EditPanel"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"

const template = require("html-loader!./projectboard.html")

export default class ProjectBoard implements Component, Panel {
  static readonly componentName = "ProjectBoard"
  readonly bkb: Bkb

  private $container: JQuery
  private $stepsPanelContainer: JQuery
  private $editPanelContainer: JQuery

  private editPanel: EditPanel

  constructor(private dash: Dash<App>, private projectId: string, title: string) {

    this.$container = $(template)
    this.$stepsPanelContainer = this.$container.find(".js-stepspanel-container")
    this.$editPanelContainer = this.$container.find(".js-editpanel-container")
    this.$container.find(".js-title").text(title)
  }

  public addStepsPanel(p: StepsPanel) {
    p.attachTo(this.$stepsPanelContainer[0])
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public hide() {
    this.$container.hide();
  }

  public init(): ProjectBoard {
    this.editPanel = this.dash.create(EditPanel, { args: [ "Edit panel" ] })
    this.editPanel.attachTo(this.$editPanelContainer[0])
    // FIXME This is only for tests. We add two StepsPanels to the project board
    let p = this.dash.create(StepsPanel, {args: [ "1", "Learn jQuery" ]})
    p.init()
    this.addStepsPanel(p)
    let q = this.dash.create(StepsPanel, {args: [ "2", "Create a dummy project" ]})
    q.init()
    this.addStepsPanel(q)

    return this;
  }

  public show() {
    this.$container.show();
  }
}