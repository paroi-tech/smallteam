import FlagBox from "../FlagBox/FlagBox"
import { TaskModel, FlagModel } from "../../../AppModel/AppModel"
import { OwnDash } from "../../../App/OwnDash"
import { MultiSelect, MultiSelectOptions } from "../../../generics/MultiSelect/MultiSelect"

export default class FlagSelector {
  private task?: TaskModel
  private selector: MultiSelect<FlagModel, OwnDash>

  constructor(private dash: OwnDash) {
    let model = this.dash.app.model

    this.selector = this.dash.create<MultiSelect<FlagModel, OwnDash>, MultiSelectOptions<FlagModel>, OwnDash>(
      MultiSelect,
      {
        title: "Flags",
        createItem: (dash, step) => dash.create(FlagBox, step)
      }
    )

    this.dash.listenToModel(["changeFlag", "reorderFlag"], () => {
      this.selector.fillWith(model.global.flags)
      if (this.task && this.task.flags)
        this.selector.selectItems(this.task.flags)
    })
    this.selector.fillWith(model.global.flags)
  }

  get el() {
    return this.selector.el
  }

  setTask(task?: TaskModel) {
    this.task = task
    this.selector.selectItems(task && task.flagIds ? task.flags || [] : [])
    this.el.style.pointerEvents = task ? "auto" : "none"
  }

  getSelectedFlagIds(): string[] {
    return this.selector.getSelected().map(flag => flag.id)
  }
}
