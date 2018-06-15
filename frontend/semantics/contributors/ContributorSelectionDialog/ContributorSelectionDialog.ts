import { Dash } from "bkb"
import { Model, ContributorModel } from "../../../AppModel/AppModel"
import CheckboxMultiSelect from "../../../generics/CheckboxMultiSelect/CheckboxMultiSelect"
import ContributorBox from "../ContributorBox/ContributorBox"
import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"

const template = require("./ContributorSelectionDialog.monk")

export default class ContributorSelectionDialog {
  readonly el: HTMLDialogElement
  private buttonEl: HTMLButtonElement

  private model: Model
  private selector: CheckboxMultiSelect<ContributorModel>

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    let view = render(template)
    this.el = view.rootEl()
    this.buttonEl = view.ref("button")
    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
    this.buttonEl.addEventListener("click", ev => {
      this.el.close()
      this.dash.emit("contributorSelectionDialogClosed")
    })

    this.selector = this.createMultiSelect()
    view.ref("selectorContainer").appendChild(this.selector.el)
  }

  public show() {
    document.body.appendChild(this.el)
    this.el.showModal()
  }

  public selectContributors(arr: ContributorModel[]) {
    this.selector.selectItems(arr)
  }

  public selectedContributors() {
    return this.selector.getSelected()
  }

  private createMultiSelect() {
    let ms = this.dash.create(
      CheckboxMultiSelect,
      "Contributors",
      (dash: Dash, contributor: ContributorModel) => dash.create(ContributorBox, contributor)
    ) as any

    let events = ["updateContributor", "createContributor", "deleteContributor"]
    this.dash.listenToModel(events, data => ms.setAllItems(this.model.global.steps))
    ms.setAllItems(this.model.global.contributors)

    return ms
  }
}
