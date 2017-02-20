import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"
import { TaskModel } from "../Model/Model"
import * as MonkBerry from "monkberry"

import * as template  from "./taskpanel.monk"

export default class TaskPanel implements Panel {
  private container: HTMLElement

  private view: MonkberryView
  private task: TaskModel | undefined = undefined

  constructor(private dash: Dash<App>, title: string) {
    this.container = document.createElement("div")
    this.container.classList.add("TaskPanel")
    this.view = MonkBerry.render(template, this.container)
  }

  public attachTo(el: HTMLElement) {
    el.appendChild(this.container)
  }

  public fillWith(task: TaskModel) {
    this.task = task
    this.view.update({
      description: task.description || "",
      label: task.label
    })
  }

  public hide() {
    this.container.style.display = "none"
  }

  public show() {
    this.container.style.display = "block"
  }
}