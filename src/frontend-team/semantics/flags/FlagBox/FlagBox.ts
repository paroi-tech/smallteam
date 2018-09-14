import { render } from "@fabtom/lt-monkberry"
import { OwnDash } from "../../../App/OwnDash"
import { FlagModel } from "../../../AppModel/AppModel"
import { Box } from "../../../generics/BoxList/BoxList"

const template = require("./FlagBox.monk")

export default class FlagBox implements Box {
  readonly el: HTMLElement

  constructor(private dash: OwnDash, readonly flag: FlagModel) {
    let view = render(template)
    let colorEl = view.ref<HTMLElement>("boxColor")

    this.el = view.rootEl()
    colorEl.style.color = this.flag.color
    this.el.addEventListener("click", () => this.dash.emit("flagBoxSelected", this.flag))
    view.update(this.flag)

    this.dash.listenToModel("updateFlag", data => {
      let flag = data.model as FlagModel

      if (flag.id === this.flag.id) {
        view.update(this.flag)
        colorEl.style.color = this.flag.color
      }
    })
  }

  setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }

  get id(): string {
    return this.flag.id
  }
}
