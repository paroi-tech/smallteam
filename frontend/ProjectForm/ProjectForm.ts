import * as $ from "jquery"
import { Component, Dash, Bkb } from "bkb"
import App from "../App/App"

const template = require("html-loader!./projectform.html")

export default class PanelSelector implements Component {
  static readonly componentName = "Menu"
  readonly bkb: Bkb

  private $container: JQuery
  private $form: JQuery

  constructor(private dash: Dash<App>) {

  }
}