import { Log } from "bkb"
import { Model, AccountModel } from "../../../AppModel/AppModel"
import { AccountCreateFragment, AccountUpdateFragment } from "../../../../shared/meta/Account"
import { whyNewPasswordIsInvalid } from "../../../../shared/libraries/helpers"
import { OwnDash } from "../../../App/OwnDash"
import { render, LtMonkberryView } from "@fabtom/lt-monkberry"
import PasswordEdit from "../../../../sharedFrontend/PasswordEdit/PasswordEdit"
import { WarningDialog } from "../../../../sharedFrontend/modalDialogs/modalDialogs"

const template = require("./AccountForm.monk")

export default class AccountForm {
  readonly el: HTMLElement
  private fieldsetEl: HTMLFieldSetElement
  private loginEl: HTMLInputElement
  private nameEl: HTMLInputElement
  private emailEl: HTMLInputElement
  private roleEl: HTMLSelectElement
  private submitSpinnerEl: HTMLElement

  private passwordEdit: PasswordEdit

  private view: LtMonkberryView
  private state = {
    login: "",
    name: "",
    email: "",
    role: ""
  }

  private model: Model
  private currentAccount: AccountModel | undefined
  private log: Log

  /**
   * Property used to know whether we can empty the fields of the form after
   * the model has successfully created a account.
   */
  private canClearForm = false

  constructor(private dash: OwnDash, showPasswordFields = true) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.view = render(template)
    this.el = this.view.rootEl()
    this.fieldsetEl = this.view.ref("fieldset")
    this.nameEl = this.view.ref("name")
    this.loginEl = this.view.ref("login")
    this.emailEl = this.view.ref("email")
    this.roleEl = this.view.ref("role")
    this.submitSpinnerEl = this.view.ref("submitSpinner")
    this.view.ref("submitBtn").addEventListener("click", () => this.onSubmit())

    this.passwordEdit = this.dash.create(PasswordEdit)
    if (this.model.session.account.role === "admin" && showPasswordFields)
      this.view.ref("password").appendChild(this.passwordEdit.el)

    this.view.update(this.state)

    this.dash.listenToModel("updateAccount", data => this.onAccountUpdate(data.model))
    this.dash.listenToModel("endProcessingAccount", data => this.onEndProcessing(data.model))
    this.dash.listenToModel("processingAccount", data => this.onProcessing(data.model))
  }

  public reset() {
    this.currentAccount = undefined
    this.resetState()
    this.view.update(this.state)
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

    this.currentAccount = account
    this.state = account.updateTools.toFragment("update") as any
    this.view.update(this.state)
    this.roleEl.value = this.state.role
    this.passwordEdit.clear()

    if (account.updateTools.processing)
      this.lockForm()
    else
      this.unlockForm()
  }

  get account(): AccountModel | undefined {
    return this.currentAccount
  }

  // --
  // -- Event handlers
  // --

  private async onSubmit() {
    let data = this.checkUserInput()

    if (!data)
      return

    if (!this.currentAccount) {
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
      this.updatePassword(this.currentAccount.id, this.currentAccount.login, password)
      this.passwordEdit.clear()
    }

    let id = this.currentAccount.id
    let frag = this.currentAccount.updateTools.getDiffToUpdate({ id, ...data })
    // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    if (frag && (Object.keys(frag).length !== 0 || frag.constructor !== Object))
      this.updateAccount({ id, ...frag })
  }

  private onProcessing(data: AccountModel) {
    if (!this.currentAccount || this.currentAccount.id !== data.id)
      return
    this.lockForm()
  }

  private onEndProcessing(data: AccountModel) {
    if (!this.currentAccount || this.currentAccount.id !== data.id)
      return
    this.unlockForm()
  }

  private onAccountUpdate(account: AccountModel) {
    if (!this.currentAccount || this.currentAccount.id !== account.id)
      return
    console.log("[DEBUG] onAccountUpdate", account)
    this.canClearForm = false
    this.state = account.updateTools.toFragment("update") as any
    this.view.update(this.state)
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
    if (!this.currentAccount)
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

    if (frag.login.length < 4) {
      this.log.warn("Login should have at least 4 characters...")
      this.loginEl.focus()
      return undefined
    }

    if (!this.validateEmail(frag.email)) {
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
    this.state.name  = ""
    this.state.role  = ""
  }

  private validateEmail(email: string): boolean {
    // Email address is limited to 254 characters => https://en.wikipedia.org/wiki/Email_address
    return (email.length > 0 && email.length <= 254)
  }

  private showIndicator() {
    this.submitSpinnerEl.style.display = "inline"
  }

  private hideIndicator() {
    this.submitSpinnerEl.style.display = "none"
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
