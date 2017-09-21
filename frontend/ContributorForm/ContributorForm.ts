import App from "../App/App"
import { Bkb, Dash } from "bkb"
import { Model, ContributorModel } from "../Model/Model"
import { render } from "monkberry"
import directives from "monkberry-directives"
import * as template from "./projectform.monk"

export default class ProjectForm {
  readonly el: HTMLElement

  private loginEl: HTMLInputElement
  private nameEl: HTMLInputElement
  private emailEl: HTMLTextAreaElement
  private submitSpinnerEl: HTMLElement

  private view: MonkberryView

  private state = {
    name:  "",
    login: "",
    email: "",
    ctrl: {
      submit: () => this.onSubmit().catch(console.log)
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
    this.view.update(this.state)
  }

  private async onSubmit() {
    let name = this.nameEl.value.trim()
    let login = this.loginEl.value.trim()
    if (name.length < 4 || login.length < 4) {
      console.warn("Name and login should have at least 4 characters...")
      return
    }
    if (this.contributor)
      this.createContributor(name, login, "")
    else
      this.updateContributor(name, login, "")
  }

  private async createContributor(name: string, login: string, email: string) {
    let frag = { name, login, email }
    try {
      this.contributor = await this.model.exec("create", "Contributor", frag)
      this.updateView()
    } catch (err) {
      console.error(`Unable to create new contributor...`)
    }
  }

  private async updateContributor(name: string, login: string, email: string) {
    if (!this.contributor)
      return
    let frag = {
      id: this.contributor.id,
      name,
      login,
      email
    }
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
    this.view.update(this.state)
  }

  private validateEmail(email: string): boolean {
    // The total length of an email address is limited to 254 characters.
    // https://en.wikipedia.org/wiki/Email_address
    if (email.length > 254)
      return false
    return true
  }
}
