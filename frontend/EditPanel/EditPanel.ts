import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"

const panelTpl = require("html-loader!./editpanel.html")

export default class EditPanel implements Component, Panel {
  static readonly componentName = "EditPanel"
  readonly bkb: Bkb

  private $container: JQuery

  constructor(private dash: Dash<App>, title: string) {
    this.$container = $(panelTpl)
    this.$container.find(".js-title").text(title)
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public hide() {
    this.$container.hide()
  }

  public show() {
    this.$container.show()
  }
}