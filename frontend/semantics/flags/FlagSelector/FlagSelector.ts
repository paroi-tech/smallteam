import { Dash } from "bkb"
import { render } from "monkberry"
import FlagBox from "../FlagBox/FlagBox"
import { Model, TaskModel, FlagModel, UpdateModelEvent, ReorderModelEvent } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { OwnDash } from "../../../App/OwnDash";

const template = require("./FlagSelector.monk")
const liTemplate = require("./li.monk")

export default class FlagSelector {
  readonly el: HTMLElement
  private listEl: HTMLElement

  private view: MonkberryView

  private model: Model
  private currentTask: TaskModel | undefined

  private items = new Map<string, HTMLElement>()
  private checkBoxes = new Map<String, HTMLInputElement>()

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.listEl = this.el.querySelector("ul") as HTMLElement

    this.model.global.flags.forEach(flag => this.addItemFor(flag))

    // Listen to flag creation event.
    this.dash.listenToModel("createFlag", data => {
      this.addItemFor(data.model as FlagModel)
    })

    // Listen to flag deletion event in order to remove corresponding item from the selector.
    // IMPORTANT: What happens to orderNums where a flag is deleted ?
    this.dash.listenToModel("deleteFlag", data => {
      let flagId = data.id as string
      let li = this.items.get(flagId)
      if (li)
        this.listEl.removeChild(li)
      this.checkBoxes.delete(flagId)
    })

    // Listen to flag reorder event.
    this.dash.listenToModel<ReorderModelEvent>("reorder", data => {
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

  get task(): TaskModel | undefined {
    return this.currentTask
  }

  set task(task: TaskModel| undefined) {
    for (let checkBox of this.checkBoxes.values())
      checkBox.checked = false

    this.currentTask = task
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
    if (!this.currentTask)
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
    if (!this.currentTask || !this.currentTask.flagIds)
      return

    for (let flagId of this.currentTask.flagIds) {
      let checkBox = this.checkBoxes.get(flagId)
      if (checkBox)
        checkBox.checked = true
    }
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
}

