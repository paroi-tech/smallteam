import { Dash } from "bkb"
import { Box } from "../../../generics/BoxList/BoxList";
import { Model, FlagModel, UpdateModelEvent } from "../../../AppModel/AppModel";
import App from "../../../App/App"
import { OwnDash } from "../../../App/OwnDash";
import { render } from "@fabtom/lt-monkberry";

const template = require("./FlagBox.monk")

export default class FlagBox implements Box {
  readonly el: HTMLElement

  constructor(private dash: OwnDash, readonly flag: FlagModel) {
    let view = render(template)
    this.el = view.rootEl()
    let colorEl = view.ref<HTMLElement>("boxColor")
    colorEl.style.color = this.flag.color
    this.el.addEventListener("click", ev => this.dash.emit("flagBoxSelected", this.flag))
    view.update(this.flag)

    this.dash.listenToModel("updateFlag", data => {
      let flag = data.model as FlagModel
      if (flag.id === this.flag.id) {
        view.update(this.flag)
        colorEl.style.color = this.flag.color
      }
    })
  }

  public setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }

  get id(): string {
    return this.flag.id
  }
}
