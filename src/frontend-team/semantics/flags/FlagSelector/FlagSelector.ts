import { render } from "@fabtom/lt-monkberry"
import FlagBox from "../FlagBox/FlagBox"
import { Model, TaskModel, FlagModel } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash"

import template = require("./FlagSelector.monk")
import liTemplate = require("./li.monk")
import { CheckboxMultiSelect } from "../../../generics/CheckboxMultiSelect/CheckboxMultiSelect"
import App from "../../../App/App";

export default class FlagSelector {
  readonly el: HTMLElement
  private listEl: HTMLElement

  private model: Model
  private task?: TaskModel

  private items = new Map<string, HTMLElement>()
  private checkBoxes = new Map<String, HTMLInputElement>()
  private flags = new WeakMap<HTMLInputElement, FlagModel>()
  // private selector: CheckboxMultiSelect<FlagModel>

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    let view = render(template)

    this.el = view.rootEl()

    // this.selector = this.dash.create<CheckboxMultiSelect<FlagModel, App>>(
    //   CheckboxMultiSelect,
    //   {
    //     title: "Flags",
    //     createItem: (dash: OwnDash, step: FlagModel) => dash.create(FlagBox, step)
    //   }
    // )
    // this.dash.listenToModel(["changeFlag", "reorderFlag"], () => {
    //   this.selector.fillWith(this.model.global.flags)
    //   if (this.task && this.task.flags)
    //     this.selector.selectItems(this.task.flags)
    // })
    // this.selector.fillWith(this.model.global.flags)
    // // TODO:

    this.listEl = view.ref("ul")
    this.listEl.addEventListener("change", ev => {
      let flag = this.flags.get(ev.target as any)
      if (flag) {
        this.dash.emit("change", {
          type: "Flag",
          selected: flag
        })
      }
    })

    for (let flag of this.model.global.flags)
      this.addItemFor(flag)

    this.dash.listenToModel("createFlag", data => this.addItemFor(data.model as FlagModel))
    this.dash.listenToModel("deleteFlag", data => {
      // IMPORTANT: What happens to orderNums when a flag is deleted ?
      let flagId = data.id as string
      let li = this.items.get(flagId)
      if (li)
        this.listEl.removeChild(li)
      this.checkBoxes.delete(flagId)
    })
    this.dash.listenToModel("reorderFlag", data => {
      let flagIds = data.orderedIds as string[]
      for (let flagId of flagIds) {
        let el = this.items.get(flagId)
        if (el)
          this.listEl.appendChild(el)
      }
    })
  }

  getTask() {
    return this.task
  }

  setTask(task?: TaskModel) {
    this.task = task
    if (task) {
      if (task.flagIds) {
        for (let flagId of task.flagIds) {
          let checkBox = this.checkBoxes.get(flagId)
          if (checkBox)
            checkBox.checked = true
        }
      }
      this.el.style.pointerEvents = "auto"
    } else {
      this.task = undefined
      for (let checkBox of this.checkBoxes.values())
        checkBox.checked = false
      this.el.style.pointerEvents = "none"
    }
  }

  getSelectedFlagIds(): string[] {
    let arr = [] as string[]

    if (this.task) {
      for (let entry of this.checkBoxes.entries()) {
        if (entry[1].checked)
          arr.push(entry[0] as string)
      }
    }

    return arr
  }

  /**
   * Refresh the state of the checkboxes in the selector.
   *
   * Note: use when the task update fails.
   */
  refreshFlags() {
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

  private addItemFor(flag: FlagModel) {
    let box = this.dash.create(FlagBox, flag)
    let view = render(liTemplate)
    let li = view.rootEl() as HTMLLIElement
    let checkBox = view.ref("checkbox") as HTMLInputElement

    this.items.set(flag.id, li)
    this.checkBoxes.set(flag.id, checkBox)
    this.flags.set(checkBox, flag)
    li.appendChild(box.el)
    this.listEl.appendChild(li)
  }
}
