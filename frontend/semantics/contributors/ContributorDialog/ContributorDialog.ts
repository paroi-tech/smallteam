import { Dash } from "bkb"
import { Model, TaskModel, UpdateModelEvent, ContributorModel } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import CheckboxMultiSelect from "../../../generics/CheckboxMultiSelect/CheckboxMultiSelect"
import { render } from "monkberry"
import ContributorBox from "../ContributorBox/ContributorBox"

const template = require("./ContributorDialog.monk")

export default class ContributorDialog {
  readonly el: HTMLDialogElement
  private buttonEl: HTMLButtonElement
  private selectorContainerEl: HTMLElement

  private model: Model
  private selector: CheckboxMultiSelect<ContributorModel>
  private view: MonkberryView

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model

    this.view = render(template, document.createElement("div"))
    this.el = this.view.nodes[0] as HTMLDialogElement
    this.buttonEl = this.el.querySelector(".js-button") as HTMLButtonElement
    this.selectorContainerEl = this.el.querySelector(".js-selector-container") as HTMLElement
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
    this.dash.listenTo<UpdateModelEvent>(this.model, events).onData(
      data => ms.setAllItems(this.model.global.steps)
    )
    ms.setAllItems(this.model.global.contributors)

    return ms
  }
}
