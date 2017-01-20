import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import App from "../App/App"

const panelTpl = require("html-loader!./editpanel.html")

export default class EditPanel implements Component {
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
}