import { LtMonkberryView, render } from "@tomko/lt-monkberry"
import { Log } from "bkb"
import { FlagCreateFragment, FlagUpdateFragment } from "../../../../../shared/meta/Flag"
import { OwnDash } from "../../../App/OwnDash"
import { FlagModel, Model } from "../../../AppModel/AppModel"

const template = require("./FlagForm.monk")

export default class FlagForm {
  readonly el: HTMLElement
  private fieldsetEl: HTMLFieldSetElement
  private labelEl: HTMLInputElement
  private colorEl: HTMLInputElement
  private orderNumEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private view: LtMonkberryView
  private state = {
    frag: {
      label: "",
      color: "#000",
      orderNum: "",
    }
  }

  private model: Model
  private flag?: FlagModel

  private log: Log

  /**
   * Property used to know whether we can empty the fields of the form afer
   * the model has successfully created a account.
   */
  private canClearForm = false

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.view = render(template)
    this.el = this.view.rootEl()
    this.fieldsetEl = this.view.ref("fieldset")
    this.labelEl = this.view.ref("label")
    this.colorEl = this.view.ref("color")
    this.orderNumEl = this.view.ref("orderNum")
    this.spinnerEl = this.view.ref("spinner")

    this.view.ref("submitBtn").addEventListener("click", () => this.onSubmit())

    this.dash.listenToModel("deleteFlag", data => {
      let id = data.id as string
      if (this.flag && this.flag.id === id)
        this.reset()
    })
    this.dash.listenToModel("updateFlag", data => {
      let id = data.id as string
      if (this.flag && this.flag.id === id)
        this.updateView()
    })
    this.dash.listenToModel("endProcessingAccount", data => this.onEndProcessing(data.model))
    this.dash.listenToModel("processingAccount", data => this.onProcessing(data.model))
  }

  getFlag() {
    return this.flag
  }

  setFlag(flag: FlagModel) {
    this.canClearForm = false
    this.flag = flag
    this.updateView()
  }

  reset() {
    this.flag = undefined
    this.state.frag.color = "#000000"
    this.state.frag.label = ""
    this.state.frag.orderNum = ""
    this.view.update(this.state)
  }

  switchToCreationMode() {
    this.reset()
    this.labelEl.focus()
  }

  // --
  // -- Utilities
  // --

  private updateView() {
    if (!this.flag)
      return
    this.state.frag.color = this.flag.color
    this.state.frag.label = this.flag.label
    this.state.frag.orderNum = (this.flag.orderNum || "").toString()
    this.view.update(this.state)
  }

  // --
  // -- Event handlers
  // --

  private onProcessing(flag: FlagModel) {
    if (!this.flag || this.flag.id !== flag.id)
      return
    this.lockForm()
  }

  private onEndProcessing(flag: FlagModel) {
    if (!this.flag || this.flag.id !== flag.id)
      return
    this.unlockForm()
  }

  private onSubmit() {
    let label = this.labelEl.value.trim()
    let color = this.colorEl.value.trim()

    if (!this.checkUserInput(label, color))
      return

    if (!this.flag) {
      this.canClearForm = true
      this.createFlag({ label, color })
    } else {
      let id = this.flag.id
      let frag = this.flag.updateTools.getDiffToUpdate({ id, label, color })
      if (frag && (Object.keys(frag).length !== 0 || frag.constructor !== Object))
        this.updateFlag({ ...frag, id })
    }
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

  private async createFlag(frag: FlagCreateFragment) {
    this.showSpinner()
    try {
      await this.model.exec("create", "Flag", frag)
      if (this.canClearForm)
        this.reset()
    } catch (err) {
      this.log.error("Unable to create new flag...", err)
      this.labelEl.focus()
    }
    this.hideSpinner()
  }

  private async updateFlag(frag: FlagUpdateFragment) {
    this.showSpinner()
    if (!this.flag)
      return
    try {
      this.flag = await this.model.exec("update", "Flag", frag)
      this.updateView()
    } catch (err) {
      this.log.error(`Unable to update account...`)
    }
    this.hideSpinner()
  }

  private lockForm() {
    this.fieldsetEl.disabled = true
    this.showSpinner()
  }

  private unlockForm() {
    this.fieldsetEl.disabled = false
    this.hideSpinner()
  }

  private showSpinner() {
    this.spinnerEl.hidden = false
  }

  private hideSpinner() {
    this.spinnerEl.hidden = true
  }
}
