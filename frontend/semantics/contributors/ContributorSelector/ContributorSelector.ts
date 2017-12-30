import { Dash } from "bkb"
import ContributorBox from "../ContributorBox/ContributorBox"
import { render } from "monkberry"
import BoxList from "../../../generics/BoxList/BoxList"
import { Model, TaskModel, UpdateModelEvent, ContributorModel } from "../../../AppModel/AppModel"
import App from "../../../App/App"

const template = require("./ContributorSelector.monk")
const itemTemplate = require("./label.monk")

/**
 * The idea of a list of checkbox was found here:
 * https://stackoverflow.com/questions/17714705/how-to-use-checkbox-inside-select-option
 */
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
  private currentTask: TaskModel | undefined

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createView()
    this.createChildComponents()
    this.model.global.contributors.forEach(c => this.addSelectorFor(c))
    this.listenToModel()
  }

  public reset() {
    this.currentTask = undefined
    this.boxList.clear()
    for (let checkBox of this.checkBoxes.values())
      checkBox.checked = false
  }

  public refresh() {
    this.reset()
    if (!this.currentTask || !this.currentTask.affectedToIds)
      return

    for (let id of this.currentTask.affectedToIds) {
      let contributor = this.model.global.contributors.get(id)
      if (contributor)
        this.addBoxFor(contributor)

      let checkBox = this.checkBoxes.get(id)
      if (checkBox)
        checkBox.checked = true
    }
  }

  // --
  // -- Event handlers
  // --

  private listenToModel() {
    // Contributor creation.
    this.dash.listenTo<UpdateModelEvent>(this.model, "createContributor").onData(data => {
      this.addSelectorFor(data.model as ContributorModel)
    })

    // Contributor update.
    this.dash.listenTo<UpdateModelEvent>(this.model, "updateContributor").onData(data => {
      let contributor = data.model as ContributorModel
      let view = this.itemViews.get(contributor.id)

      if (view)
        view.update({ value: contributor.name })
    })

    // Contributor deletion.
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteContributor").onData(data => {
      let contributorId = data.id as string
      let el = this.items.get(contributorId)
      if (el)
        this.listEl.removeChild(el)

      this.checkBoxes.delete(contributorId)
      this.itemViews.delete(contributorId)
      this.items.delete(contributorId)
      this.boxList.removeBox(contributorId)
    })
  }

  // --
  // -- Accessors
  // --

  get task(): TaskModel | undefined {
    return this.currentTask
  }

  set task(task: TaskModel | undefined) {
    this.reset()
    if (!task) {
      this.listEl.style.pointerEvents = "none"
      return
    }

    this.currentTask = task
    this.listEl.style.pointerEvents = "auto"
    if (!task.affectedToIds)
      return
    task.affectedToIds.forEach(id => {
      let contributor = this.model.global.contributors.get(id)
      if (contributor)
        this.addBoxFor(contributor)

      let checkBox = this.checkBoxes.get(id)
      if (checkBox)
        checkBox.checked = true
    })
  }

  get selectedContributorIds(): string[] {
    return this.currentTask ? this.boxList.getOrder() : []
  }

  // --
  // -- Utilities
  // --

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

  private createChildComponents() {
    this.boxList = this.dash.create(BoxList, {
      id: "",
      name: "Affected contributors",
      group: undefined,
      sort: true,
      inline: true
    })
    this.boxListContainerEl.appendChild(this.boxList.el)
  }

  private addSelectorFor(contributor: ContributorModel) {
    let view = render(itemTemplate, document.createElement("div"))
    let itemEl = view.nodes[0]as HTMLElement
    let checkBox = itemEl.querySelector("input") as HTMLInputElement

    checkBox.addEventListener("click", ev => {
      // TODO: Improve this. Use a map to store old ContributorBoxes and reuse them,
      // instead of creating new ones each time.
      if (checkBox.checked)
        this.addBoxFor(contributor)
      else
        this.boxList.removeBox(contributor.id)
    })

    view.update({ value: contributor.name })
    this.itemViews.set(contributor.id, view)
    this.items.set(contributor.id, itemEl)
    this.checkBoxes.set(contributor.id, checkBox)
    this.listEl.appendChild(itemEl)
  }

  private addBoxFor(contributor: ContributorModel) {
    let box = this.dash.create(ContributorBox, contributor)
    this.boxList.addBox(box)
  }
}
