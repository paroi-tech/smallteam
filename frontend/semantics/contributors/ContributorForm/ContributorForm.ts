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
  private contributor: ContributorModel | undefined
  private log: Log

  private canClearForm = false

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log
    this.el = this.createHtmlElements()

    this.dash.listenTo<ContributorModel>(this.model, "endProcessingContributor").onData(
      data => this.onEndProcessing(data)
    )
    this.dash.listenTo<ContributorModel>(this.model, "processingContributor").onData(
      data => this.onProcessing(data)
    )
  }

  public reset() {
    this.contributor = undefined

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
  // -- Initialization functions
  // --

  private createHtmlElements() {
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
  // -- Accessors
  // --

  public setContributor(contributor: ContributorModel) {
    console.log("url", contributor.avatarUrl)

    this.canClearForm = false
    this.contributor  = contributor

    this.state.frag = contributor.updateTools.toFragment("update") as any
    this.view.update(this.state)

    if (contributor.updateTools.processing)
      this.lockForm()
    else
      this.unlockForm()
  }

  get currentContributor(): ContributorModel | undefined {
    return this.contributor
  }

  // --
  // -- Event handlers
  // --

  private async onSubmit() {
    let data = this.checkUserInput()
    if (!data)
      return

    this.lockForm()
    if (!this.contributor) {
      this.canClearForm = true
      await this.createContributor(data)
      if (this.canClearForm)
        this.switchToCreationMode()
    } else {
      let id = this.contributor.id
      let frag = this.contributor.updateTools.getDiffToUpdate({ id, ...data })

      // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
      if (frag && (Object.keys(frag).length !== 0 || frag.constructor !== Object))
        this.updateContributor({ id, ...frag })
      else
        this.unlockForm()
    }
  }

  private onEndProcessing(data: ContributorModel) {
    if (!this.contributor || this.contributor.id !== data.id)
      return

    this.canClearForm = false
    this.state.frag = this.contributor.updateTools.toFragment("update") as any
    this.view.update(this.state)

    this.unlockForm()
  }

  private onProcessing(data: ContributorModel) {
    if (!this.contributor || this.contributor.id !== data.id)
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
    if (!this.contributor)
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
