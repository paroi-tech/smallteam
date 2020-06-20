import { Log } from "bkb"
import handledom from "handledom"
import PasswordEdit from "../../../../shared-ui/components/PasswordEdit"
import { validateEmail } from "../../../../shared-ui/libraries/utils"
import WarningDialog from "../../../../shared-ui/modal-dialogs/WarningDialog"
import { whyNewPasswordIsInvalid, whyUsernameIsInvalid } from "../../../../shared/libraries/helpers"
import { AccountCreateFragment, AccountUpdateFragment } from "../../../../shared/meta/Account"
import { OwnDash } from "../../AppFrame/OwnDash"
import { AccountModel, Model } from "../../AppModel/AppModel"

// tslint:disable-next-line: no-unused-expression
scss`
.AccountForm {
  &-header {
    display: flex;
    justify-content: space-between;
  }
}
`

const template = handledom`
<section class="AccountForm">
  <h1 class="TitleBar" h="header">Account details</h1>
  <fieldset class="FieldGroup" h="fieldset">
    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Name</span>
      <input class="Field-input" type="text" value={{ name }} h="name">
    </label>

    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Login</span>
      <input class="Field-input" type="text" value={{ login }} h="login">
    </label>

    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Email</span>
      <input class="Field-input" type="email" value={{ email }} placeholder="john.doe@example.com" h="email">
    </label>

    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Role</span>
      <select class="Field-input" h="role">
        <option value="admin">Admin</option>
        <option value="contrib" selected="selected">Contributor</option>
      </select>
    </label>

    <div class="FieldGroup-item" h="password"></div>

    <div class="FieldGroup-action">
      <button class="Btn WithLoader -right" type="button" h="submitBtn">
        Save changes <span class="WithLoader-l" hidden h="submitSpinner"></span>
      </button>
    </div>
  </fieldset>
</section>
`

export default class AccountForm {
  readonly el: HTMLElement
  private fieldsetEl: HTMLFieldSetElement
  private loginEl: HTMLInputElement
  private nameEl: HTMLInputElement
  private emailEl: HTMLInputElement
  private roleEl: HTMLSelectElement
  private submitSpinnerEl: HTMLElement

  private passwordEdit: PasswordEdit

  private update: (args: any) => void
  private state = {
    login: "",
    name: "",
    email: "",
    role: ""
  }

  private model: Model
  private account: AccountModel | undefined
  private log: Log

  /**
   * Property used to know whether we can empty the fields of the form after
   * the model has successfully created a account.
   */
  private canClearForm = false

  constructor(private dash: OwnDash, showPasswordFields = true) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    const { root, ref, update } = template(this.state)
    this.update = update
    this.el = root
    this.fieldsetEl = ref("fieldset")
    this.nameEl = ref("name")
    this.loginEl = ref("login")
    this.emailEl = ref("email")
    this.roleEl = ref("role")
    this.submitSpinnerEl = ref("submitSpinner")
    ref("submitBtn").addEventListener("click", () => this.onSubmit())

    this.passwordEdit = this.dash.create(PasswordEdit)
    if (this.model.session.account.role === "admin" && showPasswordFields)
      ref("password").appendChild(this.passwordEdit.el)

    this.dash.listenToModel("updateAccount", data => this.onAccountUpdate(data.model))
    this.dash.listenToModel("endProcessingAccount", data => this.onEndProcessing(data.model))
    this.dash.listenToModel("processingAccount", data => this.onProcessing(data.model))
  }

  reset() {
    this.account = undefined
    this.resetState()
    this.update(this.state)
    this.unlockForm()
    this.nameEl.focus()
  }

  // --
  // -- Accessors
  // --

  setAccount(account: AccountModel | undefined) {
    if (!account) {
      this.canClearForm = false
      this.reset()
      return
    }

    this.account = account
    this.state = account.updateTools.toFragment("update") as any
    this.update(this.state)
    this.roleEl.value = this.state.role
    this.passwordEdit.clear()

    if (account.updateTools.processing)
      this.lockForm()
    else
      this.unlockForm()
  }

  getAccount() {
    return this.account
  }

  // --
  // -- Event handlers
  // --

  private async onSubmit() {
    let data = this.checkUserInput()

    if (!data)
      return

    if (!this.account) {
      this.canClearForm = true
      this.createAccount(data)
      return
    }

    let user = this.model.session.account
    if (user.role === "admin" && this.passwordEdit.hasPassword()) {
      if (!this.passwordEdit.passwordsMatch()) {
        await this.dash.create(WarningDialog).show("Passwords do not match.")
        this.passwordEdit.focus()
        return
      }

      let password = this.passwordEdit.getPassword()
      let checkMsg = whyNewPasswordIsInvalid(password)

      if (checkMsg) {
        await this.dash.create(WarningDialog).show(checkMsg)
        this.passwordEdit.focus()

        return
      }
      this.updatePassword(this.account.id, this.account.login, password)
      this.passwordEdit.clear()
    }

    let id = this.account.id
    let frag = this.account.updateTools.getDiffToUpdate({ id, ...data })
    // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    if (frag && (Object.keys(frag).length !== 0 || frag.constructor !== Object))
      this.updateAccount({ ...frag, id })
  }

  private onProcessing(data: AccountModel) {
    if (!this.account || this.account.id !== data.id)
      return
    this.lockForm()
  }

  private onEndProcessing(data: AccountModel) {
    if (!this.account || this.account.id !== data.id)
      return
    this.unlockForm()
  }

  private onAccountUpdate(account: AccountModel) {
    if (!this.account || this.account.id !== account.id)
      return

    this.canClearForm = false
    this.state = account.updateTools.toFragment("update") as any
    this.update(this.state)
    this.roleEl.value = this.state.role
    this.passwordEdit.clear()
  }

  // --
  // -- Model update functions
  // --

  private async createAccount(frag: AccountCreateFragment) {
    this.lockForm()
    try {
      await this.model.exec("create", "Account", frag)
      if (this.canClearForm) {
        this.reset()
        return
      }
    } catch (err) {
      this.log.error("Unable to create new account...", err)
    }
    this.unlockForm()
  }

  private async updateAccount(frag: AccountUpdateFragment) {
    if (!this.account)
      return
    this.lockForm()
    try {
      await this.model.exec("update", "Account", frag)
    } catch (err) {
      this.log.error(`Unable to update account...`)
    }
    this.unlockForm()
  }

  private async updatePassword(accountId: string, login: string, password: string) {
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/registration/set-password`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          accountId,
          password
        })
      })

      if (!response.ok) {
        this.dash.log.warn("Unable to get a response from server.")
        return
      }

      let data = await response.json()

      if (!data.done)
        this.dash.log.error("Password not changed.")
      else
        this.dash.log.info("Password successfully updated.")
    } catch (err) {
      this.dash.log.error(`Impossible to change the password for user '${login}'. Error on server`)
    }
  }

  // --
  // -- Utilities
  // --

  private checkUserInput() {
    let frag = {
      name: this.nameEl.value.trim(),
      login: this.loginEl.value.trim(),
      email: this.emailEl.value.trim(),
      role: this.roleEl.value
    }

    if (frag.name.length < 1) {
      this.log.warn("Name should have at least one character...")
      this.nameEl.focus()
      return undefined
    }

    let err = whyUsernameIsInvalid(frag.login)
    if (err) {
      this.log.warn(err)
      this.loginEl.focus()
      return undefined
    }

    if (!this.checkEmail(frag.email)) {
      this.log.warn("Invalid email...")
      this.emailEl.focus()
      return undefined
    }

    if (frag.role !== "admin" && frag.role !== "contrib") {
      this.log.warn("Account role not defined...")
      this.roleEl.focus()
      return undefined
    }

    return frag
  }

  private resetState() {
    this.state.login = ""
    this.state.email = ""
    this.state.name = ""
    this.state.role = ""
  }

  private checkEmail(email: string): boolean {
    // Email address is limited to 254 characters => https://en.wikipedia.org/wiki/Email_address
    return (email.length > 0 && email.length <= 254 && validateEmail(email))
  }

  private showIndicator() {
    this.submitSpinnerEl.hidden = false
  }

  private hideIndicator() {
    this.submitSpinnerEl.hidden = true
  }

  private lockForm() {
    this.fieldsetEl.disabled = true
    this.showIndicator()
  }

  private unlockForm() {
    this.fieldsetEl.disabled = false
    this.hideIndicator()
  }
}
