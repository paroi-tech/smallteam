import { Dash } from "bkb"
import App from "../App/App"
import { Model, FlagModel, TaskModel } from "../AppModel/AppModel"
import { UpdateModelEvent, ReorderModelEvent } from "../AppModel/ModelEngine"
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

  // TODO: Remove this function. It is no more used.
  // private async toggleFlag(flag: FlagModel): Promise<boolean> {
  //   if (!this.task)
  //     return false

  //   let a = this.task.flagIds ? this.task.flagIds.slice() : []
  //   let j = a.findIndex(id => id === flag.id)
  //   let result = false

  //   if (j == -1)
  //     a.push(flag.id) // Flag is added
  //   else
  //     a.splice(j, 1) // Flag is removed.

  //   let fragment = {
  //     id: this.task.id,
  //     flagIds: a
  //   }

  //   try {
  //     await this.model.exec("update", "Task", fragment)
  //     result = true
  //     console.log("Flag successfully toggled...")
  //   } catch (err) {
  //     console.error("Sorry, flag not updated")
  //   }

  //   return result
  // }

  private addItemFor(flag: FlagModel) {
    let box = this.dash.create(FlagBox, flag)
    let view = render(itemTemplate, document.createElement( "div"))
    let li = view.nodes[0] as HTMLLIElement
    let checkBox = li.querySelector("input") as HTMLInputElement

    // TODO: Remove this block: dead code.
    // checkBox.onclick = async ev => {
    //   if (! await this.toggleFlag(flag))
    //     checkBox.checked = !checkBox.checked
    // }
    this.items.set(flag.id, li)
    this.checkBoxes.set(flag.id, checkBox)
    li.appendChild(box.el)
    this.listEl.appendChild(li)
  }

  private listenToModel() {
    // Listen to flag deletion event in order to remove corresponding item from the selector.
    // IMPORTANT: What happens to orderNums where a flag is deleted ?
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteFlag").onData(data => {
      let flagId = data.id as string
      let li = this.items.get(flagId)
      if (li)
        this.listEl.removeChild(li)
      this.checkBoxes.delete(flagId)
    })

    // Listen to flag reorder event.
    this.dash.listenTo<ReorderModelEvent>(this.model, "reorder").onData(data => {
      if (data.type !== "Flag")
        return
      let flagIds = data.orderedIds as string[]
      flagIds.forEach(flagId => {
        let el = this.items.get(flagId)
        if (el)
          this.listEl.appendChild(el)
      })
    })
  }

  public setTask(task: TaskModel | undefined) {
    for (let checkBox of this.checkBoxes.values())
      checkBox.checked = false

    this.task = task
    if (!task) {
      this.el.style.pointerEvents = "none"
      return
    }

    this.el.style.pointerEvents = "auto"
    if (!task.flagIds)
      return
    for (let flagId of task.flagIds) {
      let checkBox = this.checkBoxes.get(flagId)
      if (checkBox)
      checkBox.checked = true
    }
  }

  get selectedFlagIds(): string[] {
    if (!this.task)
      return []
    let arr: string[] = []
    for (let entry of this.checkBoxes.entries()) {
      if (entry[1].checked)
        arr.push(entry[0] as string)
    }
    return arr
  }

  /**
   * Refresh the state of the checkboxes in the selector.
   *
   * Note: use when the task update fails.
   */
  public refreshFlags() {
    if (!this.task || !this.task.flagIds)
      return
    for (let flagId of this.task.flagIds) {
      let checkBox = this.checkBoxes.get(flagId)
      if (checkBox)
        checkBox.checked = true
    }
  }
}

