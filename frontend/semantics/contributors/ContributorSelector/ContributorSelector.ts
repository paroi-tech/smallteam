import { Dash } from "bkb"
import ContributorBox from "../ContributorBox/ContributorBox"
import BoxList from "../../../generics/BoxList/BoxList"
import { Model, TaskModel, UpdateModelEvent, ContributorModel } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import ContributorDialog from "../ContributorDialog/ContributorDialog"
import { OwnDash } from "../../../App/OwnDash";
import { render } from "@fabtom/lt-monkberry";

const template = require("./ContributorSelector.monk")
const itemTemplate = require("./label.monk")

/**
 * The idea of a list of checkbox was found here:
 * https://stackoverflow.com/questions/17714705/how-to-use-checkbox-inside-select-option
 */
export default class ContributorSelector {
  readonly el: HTMLElement
  private boxList: BoxList<ContributorBox>
  private dialog: ContributorDialog

  private model: Model
  private currentTask: TaskModel | undefined

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    let view = render(template)
    this.el = view.rootEl()

    view.ref("btn").addEventListener("click", ev => {
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
    view.ref("boxlistPh").appendChild(this.boxList.el)

    this.dialog = this.dash.create(ContributorDialog)
    this.dash.listenTo(this.dialog, "contributorSelectionDialogClosed", () => {
      let arr = this.dialog.selectedContributors()
      this.boxList.clear()
      arr.forEach(c => this.addBoxFor(c))
    })

    this.dash.listenToModel("deleteContributor", data => {
      let contributorId = data.id as string
      this.boxList.removeBox(contributorId)
    })
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
