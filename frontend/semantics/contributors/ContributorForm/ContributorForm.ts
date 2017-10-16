import { PublicDash, Dash } from "bkb"
import { render } from "monkberry"
import directives from "monkberry-directives"
import { Model, ContributorModel } from "../../../AppModel/AppModel";
import App from "../../../App/App";
import { ContributorCreateFragment, ContributorUpdateFragment } from "../../../../isomorphic/meta/Contributor";

const template = require("./ContributorForm.monk")

export default class ContributorForm {
  readonly el: HTMLElement

  private loginEl: HTMLInputElement
  private nameEl: HTMLInputElement
  private emailEl: HTMLInputElement
  private submitSpinnerEl: HTMLElement

  private view: MonkberryView

  private state = {
    frag: {
      login: "",
      name: "",
      email: ""
    },
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
    this.emailEl = el.querySelector(".js-email") as HTMLInputElement
    this.submitSpinnerEl = el.querySelector(".js-spinner") as HTMLElement

    this.view.update(this.state)

    return el
  }

  public setContributor(contributor: ContributorModel) {
    this.contributor = contributor
    this.state.frag = contributor.updateTools.toFragment("update") as any
    this.view.update(this.state)
  }

  public reset() {
    this.contributor = undefined
    this.state.frag.name = ""
    this.state.frag.login = ""
    this.state.frag.email = ""
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

    if (name.length < 1) {
      console.warn("Name should have at least one character...")
      this.nameEl.focus()
      return
    }

    if (login.length < 4) {
      console.warn("Login should have at least 4 characters...")
      this.loginEl.focus()
      return
    }

    if (!this.validateEmail) {
      console.warn("Invalid email...")
      this.emailEl.focus()
      return
    }

    this.submitSpinnerEl.style.display = "inline"
    if (!this.contributor) {
      await this.createContributor({ name, login, email })
      this.nameEl.focus()
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

  private async createContributor(frag: ContributorCreateFragment) {
    try {
      await this.model.exec("create", "Contributor", frag)
      this.reset()
    } catch (err) {
      console.error("Unable to create new contributor...", err)
      this.nameEl.focus()
    }
  }

  private async updateContributor(frag: ContributorUpdateFragment) {
    if (!this.contributor)
      return
    try {
      this.contributor = await this.model.exec("update", "Contributor", frag)
      this.state.frag = this.contributor.updateTools.toFragment("update") as any
      this.view.update(this.state)
    } catch (err) {
      console.error(`Unable to update contributor...`)
    }
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
