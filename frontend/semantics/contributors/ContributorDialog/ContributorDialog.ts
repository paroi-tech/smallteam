import { Dash } from "bkb"
import { Model, TaskModel, UpdateModelEvent, ContributorModel } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import CheckboxMultiSelect from "../../../generics/CheckboxMultiSelect/CheckboxMultiSelect"
import ContributorBox from "../ContributorBox/ContributorBox"
import { OwnDash } from "../../../App/OwnDash";
import { render } from "@fabtom/lt-monkberry";

const template = require("./ContributorDialog.monk")

export default class ContributorDialog {
  readonly el: HTMLDialogElement
  private buttonEl: HTMLButtonElement
  private selectorContainerEl: HTMLElement

  private model: Model
  private selector: CheckboxMultiSelect<ContributorModel>

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model

    let view = render(template)
    this.el = view.rootEl()
    this.buttonEl = view.ref("button")
    this.selectorContainerEl = view.ref("selectorContainer")
    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
    this.buttonEl.addEventListener("click", ev => {
      this.el.close()
      this.dash.emit("contributorSelectionDialogClosed")
    })

    this.selector = this.createMultiSelect()
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
      "Steps",
      (dash: Dash, contributor: ContributorModel) => dash.create(ContributorBox, contributor)
    ) as any
    this.selectorContainerEl.appendChild(ms.el)

    let events = ["updateContributor", "createContributor", "deleteContributor"]
    this.dash.listenToModel(events, data => ms.setAllItems(this.model.global.steps))
    ms.setAllItems(this.model.global.contributors)

    return ms
  }
}
