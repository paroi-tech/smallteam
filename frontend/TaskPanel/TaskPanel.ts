import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import { Panel } from "../PanelSelector/PanelSelector"
import { Model, TaskModel } from "../Model/Model"
import * as MonkBerry from "monkberry"

import * as template  from "./taskpanel.monk"

/**
 * Component used to display and edit detailled information about a task.
 */
export default class TaskPanel implements Panel {
  private container: HTMLElement

  private view: MonkberryView
  private task: TaskModel | undefined = undefined
  private model: Model

  constructor(private dash: Dash<App>, title: string) {
    this.model = this.dash.app.model

    this.container = document.createElement("div")
    this.container.classList.add("TaskPanel")
    this.view = MonkBerry.render(template, this.container)

    let btn = this.container.querySelector(".js-submit-button")
    if (btn && this.task)
      (btn as HTMLButtonElement).onclick = (ev) => {
        this.updateTask()
      }
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

  public updateTask() {
    let label = this.container.querySelector("") as HTMLInputElement
    let description = this.container.querySelector("") as HTMLTextAreaElement
    // if (label && label.value.length > 0 && description) {
    //   this.model.exec("update", "Task", {
    //     label: label.value,
    //     description: description.value || ""
    //   }).then(val => {

    //   }).catch(err => {

    //   })
    // }
  }

  public hide() {
    this.container.style.display = "none"
  }

  public show() {
    this.container.style.display = "block"
  }
}
