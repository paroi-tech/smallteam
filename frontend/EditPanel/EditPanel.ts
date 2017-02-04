import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"

const template = require("html-loader!./editpanel.html")

export default class EditPanel implements Panel {
  private $container: JQuery

  constructor(private dash: Dash<App>, title: string) {
    this.$container = $(template)
    this.$container.find(".js-title").text(title)
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public hide() {
    this.$container.hide()
  }

  public init(): EditPanel {
    return this
  }

  public show() {
    this.$container.show()
  }
}