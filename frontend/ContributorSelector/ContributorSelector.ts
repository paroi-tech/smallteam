import { Dash } from "bkb"
import App from "../App/App"
import { Model, FlagModel, TaskModel, ContributorModel } from "../AppModel/AppModel"
import { UpdateModelEvent, ReorderModelEvent } from "../AppModel/ModelEngine"
import ContributorBox from "../ContributorBox/ContributorBox"
import BoxList from "../BoxList/BoxList"
import { render } from "monkberry"

import * as template from "./contributorselector.monk"
import * as itemTemplate from "./item.monk"
import * as optionTemplate from "./option.monk"

export default class ContributorSelector {
  readonly el: HTMLElement
  private boxListContainerEl: HTMLElement
  private selectEl: HTMLSelectElement

  private view: MonkberryView

  private model: Model
  private task: TaskModel | undefined = undefined

  private boxes = new Map<string, ContributorBox>()
  private boxList: BoxList<ContributorBox>
  private options = new Map<string, HTMLOptionElement>()

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createView()
    this.createChildComponents()
    this.model.global.contributors.forEach(c => this.addOptionFor(c))
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"))

    let el = this.view.nodes[0] as HTMLElement

    this.boxListContainerEl = el.querySelector(".js-boxlist-container") as HTMLElement
    this.selectEl = el.querySelector(".js-select") as HTMLSelectElement

    return el
  }

  private addOptionFor(contributor: ContributorModel) {
    let option = document.createElement("option")

    option.value = contributor.id
    option.textContent = contributor.name
    this.selectEl.add(option)
    this.options.set(contributor.id, option)
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
