import { Dash } from "bkb"
import { render } from "monkberry"
import FlagBox from "../FlagBox/FlagBox"
import { Model, TaskModel, FlagModel, UpdateModelEvent, ReorderModelEvent } from "../../../AppModel/AppModel";
import App from "../../../App/App";

const template = require("./FlagSelector.monk")
const liTemplate = require("./li.monk")

export default class FlagSelector {
  readonly el: HTMLElement

  private listEl: HTMLElement

  private view: MonkberryView

  private model: Model
  private task?: TaskModel

  private items = new Map<string, HTMLElement>()
  private checkBoxes = new Map<String, HTMLInputElement>()

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createView()
    this.model.global.flags.forEach(flag => this.addItemFor(flag))
    this.listenToModel()
  }

  public setTask(task?: TaskModel) {
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
    for (let checkBox of this.checkBoxes.values())
      checkBox.checked = false
    if (!this.task || !this.task.flagIds)
      return

    for (let flagId of this.task.flagIds) {
      let checkBox = this.checkBoxes.get(flagId)
      if (checkBox)
        checkBox.checked = true
    }
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement

    this.listEl = el.querySelector("ul") as HTMLElement
    return el
  }

  private addItemFor(flag: FlagModel) {
    let box = this.dash.create(FlagBox, flag)
    let view = render(liTemplate, document.createElement( "div"))
    let li = view.nodes[0] as HTMLLIElement
    let checkBox = li.querySelector("input") as HTMLInputElement

    this.items.set(flag.id, li)
    this.checkBoxes.set(flag.id, checkBox)
    li.appendChild(box.el)
    this.listEl.appendChild(li)
  }

  private listenToModel() {
    // Listen to flag creation event.
    this.dash.listenTo<UpdateModelEvent>(this.model, "createFlag").onData(data => {
      this.addItemFor(data.model as FlagModel)
    })

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
      for (let flagId of flagIds) {
        let el = this.items.get(flagId)
        if (el)
          this.listEl.appendChild(el)
      }
    })
  }

}

