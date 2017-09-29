import App from "../App/App"
import { Bkb, Dash } from "bkb"
import { Model, ContributorModel } from "../AppModel/AppModel"
import { render } from "monkberry"
import directives from "monkberry-directives"
import { NewContributorFragment, UpdContributorFragment } from "../../isomorphic/fragments/Contributor";

import * as template from "./ContributorForm.monk"

export default class ContributorForm {
  readonly el: HTMLElement

  private loginEl: HTMLInputElement
  private nameEl: HTMLInputElement
  private emailEl: HTMLInputElement
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
    this.view = render(template, document.createElement("div"), { directives })
    let el = this.view.nodes[0] as HTMLElement

    this.nameEl = el.querySelector(".js-name") as HTMLInputElement
    this.loginEl = el.querySelector(".js-login") as HTMLInputElement
    this.passwordEl = el.querySelector(".js-password") as HTMLInputElement
    this.emailEl = el.querySelector(".js-email") as HTMLInputElement
    this.submitSpinnerEl = el.querySelector(".js-spinner") as HTMLElement

    this.view.update(this.state)

    return el
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
