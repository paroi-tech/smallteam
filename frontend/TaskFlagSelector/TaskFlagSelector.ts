import { Dash } from "bkb"
import App from "../App/App"
import { Model, FlagModel, TaskModel } from "../AppModel/AppModel"
import { UpdateModelEvent } from "../AppModel/ModelEngine"
import FlagBox from "../FlagBox/FlagBox"
import { render } from "monkberry"

import * as template from "./taskflagselector.monk"
import * as itemTemplate from "./box.monk"

export default class TaskFlagSelector {
  readonly el: HTMLElement

  private busyIndicatorEl: HTMLElement
  private listEl: HTMLElement

  private view: MonkberryView

  private model: Model
  private task: TaskModel | undefined = undefined

  private items = new Map<string, HTMLElement>()
  private checkBoxes = new Map<String, HTMLInputElement>()

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createView()
    this.model.global.flags.forEach(flag => this.addItemFor(flag))
    this.listenToModel()
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement

    this.busyIndicatorEl = el.querySelector(".js-busy-icon") as HTMLElement
    this.listEl = el.querySelector("ul") as HTMLElement
    return el
  }

  private addItemFor(flag: FlagModel) {
    let box = this.dash.create(FlagBox, flag)
    let view = render(itemTemplate, document.createElement( "div"))
    let li = view.nodes[0] as HTMLLIElement
    let checkBox = li.querySelector("input") as HTMLInputElement

    this.items.set(flag.id, li)
    this.checkBoxes.set(flag.id, checkBox)
    li.appendChild(box.el)
    this.listEl.appendChild(li)
  }

  private listenToModel() {
    // Listen to flag deletion event in order to remove corresponding item from the selector.
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteFlag").onData(data => {
      let flagId = data.id as string
      let li = this.items.get(flagId)
      if (li)
        this.listEl.removeChild(li)
      this.checkBoxes.delete(flagId)
    })
  }

  public setTask(task: TaskModel | undefined) {
    for (let checkBox of this.checkBoxes.values())
      checkBox.checked = false

    this.task = task
    if (!task || !task.flagIds) {
      this.el.style.pointerEvents = "none"
      return
    }

    for (let flagId of task.flagIds) {
      let checkBox = this.checkBoxes.get(flagId)
      if (checkBox)
      checkBox.checked = true
    }
    this.el.style.pointerEvents = "auto"
  }
}

