import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"
import { TaskModel } from "../Model/Model"
import * as MonkBerry from "monkberry"

// const template = require("html-loader!./editpanel.html")
import * as template  from "./taskpanel.monk"

export default class TaskPanel implements Panel {
  private $container: JQuery
  // private $label: JQuery
  // private $description: JQuery

  private view: any
  private task: TaskModel | undefined = undefined

  constructor(private dash: Dash<App>, title: string) {
    this.$container = $(`<div class="TaskPanel"></div>`)
    // this.$container.find(".js-title").text(title)
    // this.$label = this.$container.find(".js-task-label")
    // this.$description = this.$container.find(".js-task-description").text(title)
    this.view = MonkBerry.render(template, this.$container[0])
  }

  public attachTo(el: HTMLElement) {
    $(el).append(this.$container)
  }

  public fillWith(task: TaskModel) {
    this.task = task
    // this.$label.text(task.label)
    // if (task.description)
    //   this.$description.val(task.description)
  }

  public hide() {
    this.$container.hide()
  }

  public show() {
    this.$container.show()
  }
}