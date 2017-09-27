import App from "../App/App"
import { Bkb, Dash } from "bkb"
import { Model, ContributorModel } from "../AppModel/AppModel"
import { render } from "monkberry"
import directives from "monkberry-directives"
import * as template from "./contributorform.monk"
import { NewContributorFragment, UpdContributorFragment } from "../../isomorphic/fragments/Contributor";

export default class ContributorForm {
  readonly el: HTMLElement

  private loginEl: HTMLInputElement
  private nameEl: HTMLInputElement
  private emailEl: HTMLTextAreaElement
  private passwordEl: HTMLInputElement
  private submitSpinnerEl: HTMLElement

  private view: MonkberryView

  private state = {
    name:  "",
    login: "",
    email: "",
    password: "",
    ctrl: {
      submit: () => this.onSubmit()
    }
  }

  private model: Model
  private contributor: ContributorModel | undefined

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createHtmlElements()
  }

  private createHtmlElements() {
    let wrapperEl = document.createElement("div")

    wrapperEl.classList.add("ContributorForm")
    this.view = render(template, wrapperEl, { directives })
    this.nameEl = this.view.querySelector(".js-name")
    this.loginEl = this.view.querySelector(".js-login")
    this.passwordEl = this.view.querySelector(".js-password")
    this.emailEl = this.view.querySelector(".js-email")
    this.submitSpinnerEl = this.view.querySelector(".js-spinner")
    this.view.update(this.state)

    return wrapperEl
  }

  public setContributor(contributor: ContributorModel) {
    this.contributor = contributor
    this.updateView()
  }

  public reset() {
    this.contributor = undefined
    this.state.name = ""
    this.state.login = ""
    this.state.email = ""
    this.state.password = ""
    this.view.update(this.state)
  }

  public switchToCreationMode() {
    this.reset()
    this.nameEl.focus()
  }

  private async onSubmit() {
    let name = this.nameEl.value.trim()
    let login = this.loginEl.value.trim()
    let email = this.emailEl.value.trim()
    let passwd = this.passwordEl.value

    if (name.length < 1) {
      console.warn("Name should have at least one character...")
      this.nameEl.focus()
      return
    }

    if (login.length < 1) {
      console.warn("Login should have at least 4 characters...")
      this.loginEl.focus()
      return
    }

    if (!this.validateEmail) {
      console.warn("Invalid email...")
      this.emailEl.focus()
      return
    }

    if (!this.contributor && passwd.length < 8) {
      console.warn("Password should have at least 8 characters...")
      this.passwordEl.focus()
      return
    }

    if (this.contributor && passwd.length != 0 && passwd.length < 8) {
      console.warn("Password should have at least 8 characters...")
      this.passwordEl.focus()
      return
    }

    this.submitSpinnerEl.style.display = "inline"
    if (!this.contributor) {
      await this.createContributor({ name, login, email })
    } else {
      await this.updateContributor({
        id: this.contributor ? this.contributor.id : "",
        name,
        login,
        email
      })
    }
    this.submitSpinnerEl.style.display = "none"
  }

  private async createContributor(frag: NewContributorFragment) {
    try {
      await this.model.exec("create", "Contributor", frag)
      this.reset()
    } catch (err) {
      console.error("Unable to create new contributor...", err)
      this.nameEl.focus()
    }
  }

  private async updateContributor(frag: UpdContributorFragment) {
    if (!this.contributor)
      return
    try {
      this.contributor = await this.model.exec("update", "Contributor", frag)
      this.updateView()
    } catch (err) {
      console.error(`Unable to update contributor...`)
    }
  }

  private updateView() {
    if (!this.contributor)
      return
    this.state.name = this.contributor.name
    this.state.email = this.contributor.email
    this.state.login = this.contributor.login
    this.state.password = ""
    this.view.update(this.state)
  }

  // FIXME: Improve this method.
  private validateEmail(email: string): boolean {
    // The total length of an email address is limited to 254 characters.
    // https://en.wikipedia.org/wiki/Email_address
    if (email.length > 254)
      return false
    return true
  }
}
