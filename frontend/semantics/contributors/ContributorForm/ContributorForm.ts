import { PublicDash, Dash, Log } from "bkb"
import { render } from "monkberry"
import directives from "monkberry-directives"
import { Model, ContributorModel } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { ContributorCreateFragment, ContributorUpdateFragment } from "../../../../isomorphic/meta/Contributor"

const template = require("./ContributorForm.monk")

export default class ContributorForm {
  readonly el: HTMLElement

  private fieldsetEl: HTMLFieldSetElement
  private loginEl: HTMLInputElement
  private nameEl: HTMLInputElement
  private emailEl: HTMLInputElement
  private submitSpinnerEl: HTMLElement
  private busyIndicatorEl: HTMLElement

  private view: MonkberryView
  private state = {
    frag: {
      login: "",
      name:  "",
      email: ""
    },
    ctrl: {
      submit: () => this.onSubmit()
    }
  }

  private model: Model
  private currentContributor: ContributorModel | undefined
  private log: Log

  private canClearForm = false

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log
    this.el = this.createView()

    this.dash.listenTo<ContributorModel>(this.model, "endProcessingContributor").onData(
      data => this.onEndProcessing(data)
    )
    this.dash.listenTo<ContributorModel>(this.model, "processingContributor").onData(
      data => this.onProcessing(data)
    )
  }

  public reset() {
    this.currentContributor = undefined

    this.state.frag.name  = ""
    this.state.frag.login = ""
    this.state.frag.email = ""
    this.view.update(this.state)

    this.hideIndicators()
  }

  public switchToCreationMode() {
    this.reset()
    this.canClearForm = false
    this.unlockForm()
    this.nameEl.focus()
  }

  // --
  // -- Accessors
  // --

  set contributor(contributor: ContributorModel | undefined) {
    this.canClearForm = false

    if (!contributor) {
      this.reset()
      return
    }

    this.currentContributor  = contributor
    this.state.frag = contributor.updateTools.toFragment("update") as any
    this.view.update(this.state)

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
    this.busyIndicatorEl = el.querySelector(".js-busy-indicator") as HTMLElement
    this.submitSpinnerEl = el.querySelector(".js-submit-spinner") as HTMLElement

    this.view.update(this.state)

    return el
  }

  // --
  // -- Event handlers
  // --

  private async onSubmit() {
    let data = this.checkUserInput()
    if (!data)
      return

    this.lockForm()
    if (!this.currentContributor) {
      this.canClearForm = true
      await this.createContributor(data)
      if (this.canClearForm)
        this.switchToCreationMode()
    } else {
      let id = this.currentContributor.id
      let frag = this.currentContributor.updateTools.getDiffToUpdate({ id, ...data })

      // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
      if (frag && (Object.keys(frag).length !== 0 || frag.constructor !== Object))
        this.updateContributor({ id, ...frag })
      else
        this.unlockForm()
    }
  }

  private onEndProcessing(data: ContributorModel) {
    if (!this.currentContributor || this.currentContributor.id !== data.id)
      return

    this.canClearForm = false
    this.state.frag = this.currentContributor.updateTools.toFragment("update") as any
    this.view.update(this.state)

    this.unlockForm()
  }

  private onProcessing(data: ContributorModel) {
    if (!this.currentContributor || this.currentContributor.id !== data.id)
      return
    this.lockForm()
  }

  // --
  // -- Model update functions
  // --

  private async createContributor(frag: ContributorCreateFragment) {
    try {
      await this.model.exec("create", "Contributor", frag)
    } catch (err) {
      this.log.error("Unable to create new contributor...", err)
    }
  }

  private async updateContributor(frag: ContributorUpdateFragment) {
    if (!this.currentContributor)
      return
    try {
      await this.model.exec("update", "Contributor", frag)
    } catch (err) {
      this.log.error(`Unable to update contributor...`)
    }
  }

  // --
  // -- Utilities
  // --

  private checkUserInput() {
    let frag = {
      name:  this.nameEl.value.trim(),
      login: this.loginEl.value.trim(),
      email: this.emailEl.value.trim()
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

    return frag
  }

  private validateEmail(email: string): boolean {
    // Email address is limited to 254 characters => https://en.wikipedia.org/wiki/Email_address
    return (email.length > 0 && email.length <= 254)
  }

  private showIndicators() {
    this.busyIndicatorEl.style.display = "inline"
    this.submitSpinnerEl.style.display = "inline"
  }

  private hideIndicators() {
    this.busyIndicatorEl.style.display = "none"
    this.submitSpinnerEl.style.display = "none"
  }

  private lockForm() {
    this.fieldsetEl.disabled = true
    this.showIndicators()
  }

  private unlockForm() {
    this.fieldsetEl.disabled = false
    this.hideIndicators()
  }
}
