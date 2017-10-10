import { Dash } from "bkb"
import App from "../App/App"
import { Model, FlagModel, TaskModel, ContributorModel } from "../AppModel/AppModel"
import { UpdateModelEvent, ReorderModelEvent } from "../AppModel/ModelEngine"
import ContributorBox from "../ContributorBox/ContributorBox"
import BoxList from "../BoxList/BoxList"
import { render } from "monkberry"

import * as template from "./contributorselector.monk"
import * as itemTemplate from "./item.monk"

// Idea for list of checkbox found here:
// https://stackoverflow.com/questions/17714705/how-to-use-checkbox-inside-select-option
export default class ContributorSelector {
  readonly el: HTMLElement
  private boxListContainerEl: HTMLElement
  private listEl: HTMLSelectElement
  private buttonEl: HTMLButtonElement

  private expanded = false

  private checkBoxes = new Map<string, HTMLInputElement>()
  private itemViews = new Map<string, MonkberryView>()
  private items = new Map<string, HTMLElement>()

  private view: MonkberryView

  private boxList: BoxList<ContributorBox>

  private model: Model
  private task: TaskModel | undefined = undefined

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createView()
    this.createChildComponents()
    this.model.global.contributors.forEach(c => this.addItemFor(c))
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement

    this.boxListContainerEl = el.querySelector(".js-boxlist-container") as HTMLElement
    this.listEl = el.querySelector(".js-list") as HTMLSelectElement
    this.buttonEl = el.querySelector(".js-button") as HTMLButtonElement

    this.buttonEl.addEventListener("click", ev => {
      this.listEl.style.display = this.expanded ? "none" : "block"
      this.expanded = !this.expanded
    })

    return el
  }

  private addItemFor(contributor: ContributorModel) {
    let view = render(itemTemplate, document.createElement("div"))
    let itemEl = view.nodes[0]as HTMLElement
    let checkBox = itemEl.querySelector("input") as HTMLInputElement

    view.update({ value: contributor.name })
    this.itemViews.set(contributor.id, view)
    this.items.set(contributor.id, itemEl)
    this.checkBoxes.set(contributor.id, checkBox)
    this.listEl.appendChild(itemEl)
  }

  private createChildComponents() {
    this.boxList = this.dash.create(BoxList, {
      id: "",
      name: "Affected contributors",
      group: undefined,
      itemRemoveButton: true,
      sort: true
    })
    this.boxListContainerEl.appendChild(this.boxList.el)
  }

}
