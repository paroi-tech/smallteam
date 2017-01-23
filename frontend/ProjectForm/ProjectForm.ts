import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"

const template = require("html-loader!./projectform.html")

export default class ProjectForm implements Component {
  static readonly componentName = "ProjectForm"
  readonly bkb: Bkb

  private $container: JQuery
  private $form: JQuery

  constructor(private dash: Dash<App>) {
    this.$container = $(template)
    this.$form = this.$container.find(".js-form")
    this.$container.find(".js-title").text("Project Form")
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public hide() {
    this.$container.hide();
  }

  public show() {
    this.$container.show();
  }
}