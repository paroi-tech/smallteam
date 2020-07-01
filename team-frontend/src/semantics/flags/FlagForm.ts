import { FlagCreateFragment, FlagUpdateFragment } from "@smallteam/shared/dist/meta/Flag"
import { Log } from "bkb"
import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { FlagModel, Model } from "../../AppModel/AppModel"

const template = handledom`
<div class="FlagForm">
  <fieldset class="FieldGroup" h="fieldset">
    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Label</span>
      <input class="Field-input" type="text" h="label" required value={{ label }}>
    </label>

    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Color</span>
      <input class="Field-input" type="color" h="color" value={{ color }}>
    </label>

    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Index</span>
      <input class="Field-input" type="number" h="orderNum" disabled value={{ orderNum }}>
    </label>

    <div class="FieldGroup-action">
      <button class="Btn" type="button" h="cancelBtn">Cancel</button>
      <button class="Btn WithLoader -right" type="button" h="submitBtn">
        Submit
        <span class="WithLoader-l" hidden h="spinner"></span>
      </button>
    </div>
  </fieldset>
</div>
`

export default class FlagForm {
  readonly el: HTMLElement
  private fieldsetEl: HTMLFieldSetElement
  private labelEl: HTMLInputElement
  private colorEl: HTMLInputElement
  private orderNumEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private update: (args: any) => void
  private frag = {
    label: "",
    color: "#000",
    orderNum: ""
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

    const { root, ref, update } = template()
    this.update = update
    this.el = root
    this.fieldsetEl = ref("fieldset")
    this.labelEl = ref("label")
    this.colorEl = ref("color")
    this.orderNumEl = ref("orderNum")
    this.spinnerEl = ref("spinner")

    ref("submitBtn").addEventListener("click", () => this.onSubmit())

    this.dash.listenToModel("deleteFlag", data => {
      const id = data.id as string
      if (this.flag && this.flag.id === id)
        this.reset()
    })
    this.dash.listenToModel("updateFlag", data => {
      const id = data.id as string
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
    this.frag.color = "#000000"
    this.frag.label = ""
    this.frag.orderNum = ""
    this.update(this.frag)
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
    this.frag.color = this.flag.color
    this.frag.label = this.flag.label
    this.frag.orderNum = (this.flag.orderNum || "").toString()
    this.update(this.frag)
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
    const label = this.labelEl.value.trim()
    const color = this.colorEl.value.trim()

    if (!this.checkUserInput(label, color))
      return

    if (!this.flag) {
      this.canClearForm = true
      this.createFlag({ label, color }).catch(err => this.dash.log.error(err))
    } else {
      const id = this.flag.id
      const frag = this.flag.updateTools.getDiffToUpdate({ id, label, color })
      if (frag && (Object.keys(frag).length !== 0 || frag.constructor !== Object))
        this.updateFlag({ ...frag, id }).catch(err => this.dash.log.error(err))
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
      this.log.error("Unable to update account...")
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
