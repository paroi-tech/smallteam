import App from "../App/App"
import { Bkb, Dash } from "bkb"
import { Model, FlagModel } from "../AppModel/AppModel"
import { UpdateModelEvent } from "../AppModel/ModelEngine"
import { render } from "monkberry"
import directives from "monkberry-directives"
import { NewFlagFragment, UpdFlagFragment } from "../../isomorphic/fragments/Flag"

import * as template from "./flagform.monk"

export default class FlagForm {
  readonly el: HTMLElement

  private labelEl: HTMLInputElement
  private colorEl: HTMLInputElement
  private orderNumEl: HTMLInputElement
  private submitSpinnerEl: HTMLElement

  private view: MonkberryView

  private state = {
    label:  "",
    color: "#000000",
    orderNum: "",
    ctrl: {
      submit: () => this.onSubmit().catch(err => console.log(err))
    }
  }

  private model: Model
  private flag: FlagModel | undefined

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createView()

    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteFlag").onData(data => {
      let id = data.id as string
      if (this.flag && this.flag.id === id)
        this.reset()
    })
  }

  private createView(): HTMLElement {
    this.view = render(template, document.createElement("div"), { directives })

    let el = this.view.nodes[0] as HTMLElement

    this.labelEl = el.querySelector(".js-label") as HTMLInputElement
    this.colorEl = el.querySelector(".js-color") as HTMLInputElement
    this.orderNumEl = el.querySelector(".js-order-num") as HTMLInputElement
    this.submitSpinnerEl = el.querySelector(".fa-spinner") as HTMLElement

    this.view.update(this.state)

    return el
  }

  private updateView() {
    if (!this.flag)
      return
    this.state.label = this.flag.label
    this.state.color = this.flag.color
    this.state.orderNum = this.flag.orderNum ? this.flag.orderNum.toString() : ""
    this.view.update(this.state)
  }

  public setFlag(flag: FlagModel) {
    this.flag = flag
    this.updateView()
  }

  public reset() {
    this.flag = undefined
    this.state.color = "#000000"
    this.state.label = ""
    this.state.orderNum = ""
    this.view.update(this.state)
  }

  public switchToCreationMode() {
    this.reset()
    this.labelEl.focus()
  }

  private async onSubmit() {
    let label = this.labelEl.value.trim()
    let color = this.colorEl.value.trim()

    if (label.length < 1) {
      console.warn("Label should have at least one character...")
      this.labelEl.focus()
      return
    }

    if (color === "") {
      console.warn("Please select a color...")
      this.colorEl.focus()
      return
    }

    this.submitSpinnerEl.style.display = "inline"
    if (!this.flag)
      await this.createFlag({ label, color })
    else {
      await this.updateFlag({
        id: this.flag!.id,
        label,
        color
      })
    }
    this.submitSpinnerEl.style.display = "none"
  }

  private async createFlag(frag: NewFlagFragment) {
    try {
      await this.model.exec("create", "Flag", frag)
      this.reset()
    } catch (err) {
      console.error("Unable to create new flag...", err)
      this.labelEl.focus()
    }
  }

  private async updateFlag(frag: UpdFlagFragment) {
    if (!this.flag)
      return
    try {
      this.flag = await this.model.exec("update", "Flag", frag)
      this.updateView()
    } catch (err) {
      console.error(`Unable to update contributor...`)
    }
  }
}
