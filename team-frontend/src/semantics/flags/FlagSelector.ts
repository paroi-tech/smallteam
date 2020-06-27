import { OwnDash } from "../../AppFrame/OwnDash"
import { FlagModel, TaskModel } from "../../AppModel/AppModel"
import MultiSelect, { MultiSelectOptions } from "../../generics/MultiSelect"
import FlagBox from "./FlagBox"

export default class FlagSelector {
  private task?: TaskModel
  private selector: MultiSelect<FlagModel>

  constructor(private dash: OwnDash) {
    const model = dash.app.model

    this.selector = dash.create<MultiSelect<FlagModel>, MultiSelectOptions<FlagModel>, OwnDash>(
      MultiSelect,
      {
        title: "Flags",
        createItem: step => dash.create(FlagBox, step)
      }
    )

    dash.listenToModel(["changeFlag", "reorderFlag"], () => {
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
