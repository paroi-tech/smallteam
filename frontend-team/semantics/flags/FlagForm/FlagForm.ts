import { PublicDash, Dash, Log } from "bkb"
import { render, LtMonkberryView } from "@fabtom/lt-monkberry"
import directives from "monkberry-directives"
import { Model, FlagModel, UpdateModelEvent } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { FlagCreateFragment, FlagUpdateFragment } from "../../../../shared/meta/Flag"
import { OwnDash } from "../../../App/OwnDash"

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

  private log: Log
  private model: Model
  private currentFlag: FlagModel | undefined

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

    this.view.ref("submitBtn").addEventListener("click", ev => this.onSubmit())

    this.dash.listenToModel("deleteFlag", data => {
      let id = data.id as string
      if (this.currentFlag && this.currentFlag.id === id)
        this.reset()
    })
    this.dash.listenToModel("updateFlag", data => {
      let id = data.id as string
      if (this.currentFlag && this.currentFlag.id === id)
        this.updateView()
    })
    this.dash.listenToModel("endProcessingAccount", data => this.onEndProcessing(data.model))
    this.dash.listenToModel("processingAccount", data => this.onProcessing(data.model))
  }

  get flag(): FlagModel | undefined {
    return this.currentFlag
  }

  set flag(flag: FlagModel | undefined) {
    this.canClearForm = false
    if (!flag)
      this.reset()
    else {
      this.currentFlag = flag
      this.updateView()
    }
  }

  public reset() {
    this.currentFlag = undefined
    this.state.frag.color = "#000000"
    this.state.frag.label = ""
    this.state.frag.orderNum = ""
    this.view.update(this.state)
  }

  public switchToCreationMode() {
    this.reset()
    this.labelEl.focus()
  }

  // --
  // -- Utilities
  // --

  private updateView() {
    if (!this.currentFlag)
      return
    this.state.frag.color = this.currentFlag.color
    this.state.frag.label = this.currentFlag.label
    this.state.frag.orderNum = (this.currentFlag.orderNum || "").toString()
    this.view.update(this.state)
  }

  // --
  // -- Event handlers
  // --

  private onProcessing(flag: FlagModel) {
    if (!this.currentFlag || this.currentFlag.id !== flag.id)
      return
    this.lockForm()
  }

  private onEndProcessing(flag: FlagModel) {
    if (!this.currentFlag || this.currentFlag.id !== flag.id)
      return
    this.unlockForm()
  }

  private onSubmit() {
    let label = this.labelEl.value.trim()
    let color = this.colorEl.value.trim()

    if (!this.checkUserInput(label, color))
      return

    if (!this.currentFlag) {
      this.canClearForm = true
      this.createFlag({ label, color })
    } else {
      let id = this.currentFlag.id
      let frag = this.currentFlag.updateTools.getDiffToUpdate({ id, label, color })
      if (frag && (Object.keys(frag).length !== 0 || frag.constructor !== Object))
        this.updateFlag({ id, ...frag })
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
    if (!this.currentFlag)
      return
    try {
      this.currentFlag = await this.model.exec("update", "Flag", frag)
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
    this.spinnerEl.style.display = "inline"
  }

  private hideSpinner() {
    this.spinnerEl.style.display = "none"
  }
}
