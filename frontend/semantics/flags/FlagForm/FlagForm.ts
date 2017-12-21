import { PublicDash, Dash, Log } from "bkb"
import { render } from "monkberry"
import directives from "monkberry-directives"
import { Model, FlagModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { FlagCreateFragment, FlagUpdateFragment } from "../../../../isomorphic/meta/Flag"

const template = require("./FlagForm.monk")

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
      submit: () => this.onSubmit().catch(err => this.log.error(err))
    }
  }

  private log: Log
  private model: Model
  private flag: FlagModel | undefined

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log
    this.el = this.createView()

    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteFlag").onData(data => {
      let id = data.id as string
      if (this.flag && this.flag.id === id)
        this.reset()
    })
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

  private async onSubmit() {
    let label = this.labelEl.value.trim()
    let color = this.colorEl.value.trim()

    if (!this.checkUserInput(label, color))
      return

    this.showSpinner()
    if (!this.flag)
      await this.createFlag({ label, color })
    else {
      let id = this.flag.id
      let frag = this.flag.updateTools.getDiffToUpdate({ id, label, color })

      if (frag && (Object.keys(frag).length !== 0 || frag.constructor !== Object))
        await this.updateFlag({ id, ...frag })
    }
    this.hideSpinner()
  }

  private checkUserInput(label: string, color: string) {
    if (label.length < 1) {
      this.log.warn("Label should have at least one character...")
      this.labelEl.focus()
      return false
    }

    if (color === "") {
      this.log.warn("Please select a color...")
      this.colorEl.focus()
      return false
    }

    return true
  }

  private showSpinner() {
    this.submitSpinnerEl.style.display = "inline"
  }

  private hideSpinner() {
    this.submitSpinnerEl.style.display = "none"
  }

  private async createFlag(frag: FlagCreateFragment) {
    try {
      await this.model.exec("create", "Flag", frag)
      this.reset()
    } catch (err) {
      this.log.error("Unable to create new flag...", err)
      this.labelEl.focus()
    }
  }

  private async updateFlag(frag: FlagUpdateFragment) {
    if (!this.flag)
      return
    try {
      this.flag = await this.model.exec("update", "Flag", frag)
      this.updateView()
    } catch (err) {
      this.log.error(`Unable to update contributor...`)
    }
  }
}
