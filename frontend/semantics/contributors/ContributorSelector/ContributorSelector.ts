import { Dash } from "bkb"
import ContributorBox from "../ContributorBox/ContributorBox"
import { render } from "monkberry"
import BoxList from "../../../generics/BoxList/BoxList"
import { Model, TaskModel, UpdateModelEvent, ContributorModel } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import ContributorDialog from "../ContributorDialog/ContributorDialog"

const template = require("./ContributorSelector.monk")
const itemTemplate = require("./label.monk")

/**
 * The idea of a list of checkbox was found here:
 * https://stackoverflow.com/questions/17714705/how-to-use-checkbox-inside-select-option
 */
export default class ContributorSelector {
  readonly el: HTMLElement
  private boxListContainerEl: HTMLElement
  private buttonEl: HTMLButtonElement

  private view: MonkberryView

  private boxList: BoxList<ContributorBox>
  private dialog: ContributorDialog

  private model: Model
  private currentTask: TaskModel | undefined

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLElement
    this.boxListContainerEl = this.el.querySelector(".js-boxlist-container") as HTMLElement
    this.buttonEl = this.el.querySelector(".js-button") as HTMLButtonElement
    this.buttonEl.addEventListener("click", ev => {
      if (!this.currentTask) {
        console.log("no shit...")
        return
      }
      this.dialog.selectContributors(this.currentTask.affectedTo || [])
      document.body.appendChild(this.dialog.el)
      this.dialog.show()
    })

    this.boxList = this.dash.create(BoxList, {
      id: "",
      name: "Affected contributors",
      group: undefined,
      sort: true,
      inline: true
    })
    this.boxListContainerEl.appendChild(this.boxList.el)

    this.dialog = this.dash.create(ContributorDialog)
    this.dash.listenTo(this.dialog, "contributorSelectionDialogClosed").onEvent(ev => {
      let arr = this.dialog.selectedContributors()
      this.boxList.clear()
      arr.forEach(c => this.addBoxFor(c))
    })

    this.listenToModel()
  }

  public reset() {
    this.currentTask = undefined
    this.boxList.clear()
  }

  public refresh() {
    this.boxList.clear()
    if (!this.currentTask || !this.currentTask.affectedTo)
      return
    for (let c of this.currentTask.affectedTo)
      this.addBoxFor(c)
  }

  // --
  // -- Event handlers
  // --

  private listenToModel() {
    // Contributor deletion.
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteContributor").onData(data => {
      let contributorId = data.id as string
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
    this.currentTask = task
    if (!task || !task.affectedToIds)
      return
    task.affectedToIds.forEach(id => {
      let contributor = this.model.global.contributors.get(id)
      if (contributor)
        this.addBoxFor(contributor)
    })
  }

  get selectedContributorIds(): string[] {
    return this.currentTask ? this.boxList.getOrder() : []
  }

  // --
  // -- Utilities
  // --

  private addBoxFor(contributor: ContributorModel) {
    let box = this.dash.create(ContributorBox, contributor)
    this.boxList.addBox(box)
  }
}
