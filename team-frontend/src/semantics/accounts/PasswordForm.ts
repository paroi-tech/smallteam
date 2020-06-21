import { Log } from "bkb"
import handledom from "handledom"
import PasswordEdit from "../../../../shared-ui/components/PasswordEdit"
import ErrorDialog from "../../../../shared-ui/modal-dialogs/ErrorDialog"
import InfoDialog from "../../../../shared-ui/modal-dialogs/InfoDialog"
import { whyNewPasswordIsInvalid } from "../../../../shared/libraries/helpers"
import { OwnDash } from "../../AppFrame/OwnDash"
import { AccountModel } from "../../AppModel/AppModel"

const template = handledom`
<div>
  <h1 class="TitleBar">Change your password</h1>
  <div class="FieldGroup">
    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Current password</span>
      <input class="Field-input" type="password" h="currentPassword">
    </label>

    <div class="FieldGroup-item" h="field"></div>

    <div class="FieldGroup-action" h="actions">
      <button class="Btn" type="button" h="cancelBtn">Cancel</button>
      &nbsp;
      <button class="Btn WithLoader -right" type="button" h="submitBtn">
        Submit
        <span class="WithLoader-l" hidden h="spinner"></span>
      </button>
    </div>
  </div>
</div>
`

export default class PasswordForm {
  readonly el: HTMLElement
  private currentPasswordEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private passwordEdit: PasswordEdit

  private log: Log

  constructor(private dash: OwnDash, private account: AccountModel) {
    this.log = this.dash.app.log

    const { root, ref } = template()

    this.el = root
    this.currentPasswordEl = ref("currentPassword")
    this.spinnerEl = ref("spinner")

    this.passwordEdit = this.dash.create(PasswordEdit)
    ref("field").appendChild(this.passwordEdit.el)

    ref("submitBtn").addEventListener("click", () => this.onSubmit())
    ref("cancelBtn").addEventListener("click", () => this.onCancel())
  }

  private async onSubmit() {
    let cleanData = await this.checkUserInput()

    if (!cleanData)
      return
    this.showSpinner()
    await this.doPasswordUpdate(cleanData.currentPassword, cleanData.newPassword)
    this.hideSpinner()
  }

  private async checkUserInput() {
    let currentPassword = this.currentPasswordEl.value
    let newPassword = this.passwordEdit.getPasswordIfMatch()

    if (!newPassword) {
      await this.dash.create(InfoDialog).show("Passwords do not match.")
      this.passwordEdit.focus()
      return undefined
    }

    let checkMsg = whyNewPasswordIsInvalid(newPassword)

    if (checkMsg) {
      await this.dash.create(InfoDialog).show(checkMsg)
      this.passwordEdit.focus()

      return undefined
    }

    return { currentPassword, newPassword }
  }

  private async doPasswordUpdate(currentPassword: string, newPassword: string) {
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/registration/change-password`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (!response.ok) {
        this.log.warn("Password change request was not processed by server.")
        await this.dash.create(ErrorDialog).show("Request was not processed by server.")
        return
      }

      let result = await response.json()

      if (result.done) {
        this.clearFields()
        await this.dash.create(InfoDialog).show("Password successfully updated.")
      } else {
        let msg = "Password was not changed. Maybe you mistyped your current password."

        await this.dash.create(InfoDialog).show(msg)
      }
    } catch (err) {
      this.log.error("Error while updating password.", err)
      await this.dash.create(ErrorDialog).show("Unable to update password.")
    }
  }

  private onCancel() {
    this.clearFields()
  }

  private showSpinner() {
    this.spinnerEl.hidden = false
  }

  private hideSpinner() {
    this.spinnerEl.hidden = true
  }

  private clearFields() {
    this.currentPasswordEl.value = ""
    this.passwordEdit.clear()
  }
}
