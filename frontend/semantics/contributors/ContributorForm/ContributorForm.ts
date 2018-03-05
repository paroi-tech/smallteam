import { PublicDash, Dash, Log } from "bkb"
import { render } from "monkberry"
import directives from "monkberry-directives"
import { Model, ContributorModel } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { ContributorCreateFragment, ContributorUpdateFragment } from "../../../../isomorphic/meta/Contributor"
import config from "../../../../isomorphic/config";
import WarningDialog from "../../../generics/modal-dialogs/WarningDialog/WarningDialog";

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

  private view: MonkberryView
  private state = {
    frag: {
      login: "",
      name:  "",
      email: "",
      role: "",
      password: ""
    },
    ctrl: {
      submit: () => this.onSubmit()
    }
  }

  private model: Model
  private currentContributor: ContributorModel | undefined
  private log: Log

  /**
   * Property used to know whether we can empty the fields of the form after
   * the model has successfully created a contributor.
   */
  private canClearForm = false

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log
    this.el = this.createView()
    this.listenToModel()
    if (this.dash.app.model.session.contributor.role === "admin") {
      this.passwordEl.disabled = false
      this.passwordConfirmEl.disabled = false
    }
  }

  public reset() {
    this.currentContributor = undefined

    this.state.frag.name  = ""
    this.state.frag.login = ""
    this.state.frag.email = ""
    this.state.frag.role = ""
    this.state.frag.password = ""
    this.view.update(this.state)

    this.unlockForm()
    this.nameEl.focus()
  }

  // --
  // -- Accessors
  // --

  set contributor(contributor: ContributorModel | undefined) {
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
    this.state.frag = contributor.updateTools.toFragment("update") as any
    this.state.frag.password = ""
    this.view.update(this.state)
    this.roleEl.value = this.state.frag.role

    if (contributor.updateTools.processing)
      this.lockForm()
    else
      this.unlockForm()
  }

  get contributor(): ContributorModel | undefined {
    return this.currentContributor
  }

  // --
  // -- Initialization functions
  // --

  private createView() {
    this.view = render(template, document.createElement("div"), { directives })

    let el = this.view.nodes[0] as HTMLElement
    this.fieldsetEl = el.querySelector("fieldset") as HTMLFieldSetElement
    this.nameEl = el.querySelector(".js-name") as HTMLInputElement
    this.loginEl = el.querySelector(".js-login") as HTMLInputElement
    this.emailEl = el.querySelector(".js-email") as HTMLInputElement
    this.roleEl = el.querySelector(".js-role") as HTMLSelectElement
    this.passwordEl = el.querySelector(".js-password") as HTMLInputElement
    this.passwordConfirmEl = el.querySelector(".js-password-2") as HTMLInputElement
    this.submitSpinnerEl = el.querySelector(".js-submit-spinner") as HTMLElement

    this.view.update(this.state)

    return el
  }

  private listenToModel() {
    this.dash.listenTo<ContributorModel>(this.model, "updateContributor").onData(
      data => this.onContributorUpdate(data)
    )
    this.dash.listenTo<ContributorModel>(this.model, "endProcessingContributor").onData(
      data => this.onEndProcessing(data)
    )
    this.dash.listenTo<ContributorModel>(this.model, "processingContributor").onData(
      data => this.onProcessing(data)
    )
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
      if (this.passwordEl.value !== this.passwordConfirmEl.value) {
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
    this.canClearForm = false
    this.state.frag = contributor.updateTools.toFragment("update") as any
    this.state.frag.password = ""
    this.view.update(this.state)
    this.roleEl.value = this.state.frag.role
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
      let response = await fetch(`${config.urlPrefix}/api/session/set-password`, {
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
      name:  this.nameEl.value.trim(),
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
