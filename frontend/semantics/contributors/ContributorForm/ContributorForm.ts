import { PublicDash, Dash, Log } from "bkb"
import { Model, ContributorModel } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { ContributorCreateFragment, ContributorUpdateFragment } from "../../../../isomorphic/meta/Contributor"
import config from "../../../../isomorphic/config"
import WarningDialog from "../../../generics/modalDialogs/WarningDialog/WarningDialog"
import { UpdateModelEvent } from "../../../AppModel/ModelEngine"
import { OwnDash } from "../../../App/OwnDash"
import { render, LtMonkberryView } from "@fabtom/lt-monkberry"

const template = require("./ContributorForm.monk")

export default class ContributorForm {
  readonly el: HTMLElement

  private fieldsetEl: HTMLFieldSetElement
  private loginEl: HTMLInputElement
  private nameEl: HTMLInputElement
  private emailEl: HTMLInputElement
  private roleEl: HTMLSelectElement
  private passwordEl: HTMLInputElement
  private passwordConfirmEl: HTMLInputElement
  private submitSpinnerEl: HTMLElement

  private view: LtMonkberryView
  private state = {
    login: "",
    name: "",
    email: "",
    role: "",
    password: ""
  }

  private model: Model
  private currentContributor: ContributorModel | undefined
  private log: Log

  /**
   * Property used to know whether we can empty the fields of the form after
   * the model has successfully created a contributor.
   */
  private canClearForm = false

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.view = render(template)
    this.el = this.view.rootEl()
    this.fieldsetEl = this.view.ref("fieldset")
    this.nameEl = this.view.ref("name")
    this.loginEl = this.view.ref("login")
    this.emailEl = this.view.ref("email")
    this.roleEl = this.view.ref("role")
    this.passwordEl = this.view.ref("password")
    this.passwordConfirmEl = this.view.ref("password2")
    this.submitSpinnerEl = this.view.ref("submitSpinner")
    this.view.ref("submitBtn").addEventListener("click", () => this.onSubmit())

    this.view.update(this.state)

    this.dash.listenToModel("updateContributor", data => this.onContributorUpdate(data.model))
    this.dash.listenToModel("endProcessingContributor", data => this.onEndProcessing(data.model))
    this.dash.listenToModel("processingContributor", data => this.onProcessing(data.model))

    if (this.dash.app.model.session.contributor.role === "admin") {
      this.passwordEl.disabled = false
      this.passwordConfirmEl.disabled = false
    }
  }

  public reset() {
    this.currentContributor = undefined

    this.state.name = ""
    this.state.login = ""
    this.state.email = ""
    this.state.role = ""
    this.state.password = ""
    this.view.update(this.state)

    this.unlockForm()
    this.nameEl.focus()
  }

  // --
  // -- Accessors
  // --

  setContributor(contributor: ContributorModel | undefined) {
    if (!contributor) {
      this.canClearForm = false
      this.reset()
      return
    }

    let user = this.model.session.contributor
    let b = user.role !== "admin"
    this.passwordEl.disabled = b
    this.passwordConfirmEl.disabled = b

    this.currentContributor = contributor
    this.state = contributor.updateTools.toFragment("update") as any
    this.state.password = ""
    this.view.update(this.state)
    this.roleEl.value = this.state.role

    if (contributor.updateTools.processing)
      this.lockForm()
    else
      this.unlockForm()
  }

  get contributor(): ContributorModel | undefined {
    return this.currentContributor
  }

  // --
  // -- Event handlers
  // --

  private async onSubmit() {
    let data = this.checkUserInput()
    if (!data)
      return
    if (!this.currentContributor) {
      this.canClearForm = true
      this.createContributor(data)
      return
    }

    let user = this.model.session.contributor
    if (user.role === "admin" && this.passwordEl.value !== "") {
      let passwd = this.passwordEl.value.trim()
      if (passwd.length < 8) {
        await this.dash.create(WarningDialog).show("Passwords should contain at least 8 characters.")
        this.passwordEl.focus()
        return
      }
      if (this.passwordEl.value.trim() !== this.passwordConfirmEl.value) {
        await this.dash.create(WarningDialog).show("Passwords do not match.")
        this.passwordConfirmEl.focus()
        return
      }
      this.updatePassword(this.currentContributor.id, this.currentContributor.login, this.passwordEl.value)
      this.passwordEl.value = ""
      this.passwordConfirmEl.value = ""
    }

    let id = this.currentContributor.id
    let frag = this.currentContributor.updateTools.getDiffToUpdate({ id, ...data })
    // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    if (frag && (Object.keys(frag).length !== 0 || frag.constructor !== Object))
      this.updateContributor({ id, ...frag })
  }

  private onProcessing(data: ContributorModel) {
    if (!this.currentContributor || this.currentContributor.id !== data.id)
      return
    this.lockForm()
  }

  private onEndProcessing(data: ContributorModel) {
    if (!this.currentContributor || this.currentContributor.id !== data.id)
      return
    this.unlockForm()
  }

  private onContributorUpdate(contributor: ContributorModel) {
    if (!this.currentContributor || this.currentContributor.id !== contributor.id)
      return
    console.log("[DEBUG] onContributorUpdate", contributor)
    this.canClearForm = false
    this.state = contributor.updateTools.toFragment("update") as any
    this.state.password = ""
    this.view.update(this.state)
    this.roleEl.value = this.state.role
  }

  // --
  // -- Model update functions
  // --

  private async createContributor(frag: ContributorCreateFragment) {
    this.lockForm()
    try {
      await this.model.exec("create", "Contributor", frag)
      if (this.canClearForm) {
        this.reset()
        return
      }
    } catch (err) {
      this.log.error("Unable to create new contributor...", err)
    }
    this.unlockForm()
  }

  private async updateContributor(frag: ContributorUpdateFragment) {
    if (!this.currentContributor)
      return
    this.lockForm()
    try {
      await this.model.exec("update", "Contributor", frag)
    } catch (err) {
      this.log.error(`Unable to update contributor...`)
    }
    this.unlockForm()
  }

  private async updatePassword(contributorId: string, login: string, password: string) {
    try {
      let response = await fetch(`${config.urlPrefix}/api/registration/set-password`, {
        method: "post",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contributorId,
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
      this.log.warn("Contributor role not defined...")
      this.roleEl.focus()
      return undefined
    }

    return frag
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
