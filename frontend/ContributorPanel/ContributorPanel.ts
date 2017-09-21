import * as $ from "jquery"
import { Dash, Bkb } from "bkb"
import App from "../App/App"
import BoxList, { Box, BoxListParams } from "../BoxList/BoxList"
import { Model, ContributorModel } from "../Model/Model"
import ContributorBox from "../ContributorBox/ContributorBox"
import ContributorForm from "../ContributorForm/ContributorForm"
import { Panel } from "../WorkspaceViewer/WorkspaceViewer"
import { NewContributorFragment } from "../../isomorphic/fragments/Contributor";

const template = require("html-loader!./contributorpanel.html")

export default class ContributorPanel implements Panel {
  readonly el: HTMLElement

  private nameEl: HTMLInputElement
  private loginEl: HTMLInputElement
  private spinnerEl: HTMLElement
  private boxListContainerEl: HTMLElement
  private formContainerEl: HTMLElement

  private boxList: BoxList<ContributorBox>
  private form: ContributorForm

  private model: Model

  private contributorMap: Map<string, ContributorModel> = new Map()
  private boxMap: Map<string, ContributorBox> = new Map()

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.el = this.createHtmlElements()
    this.createChildComponents()
    this.listenToModel()
    this.listenToChildren()
    this.model.query("Contributor")
      .then(arr => this.fillBoxList(arr))
      .catch(err => console.error("Error while loading contributors in ContributorPanel"))
  }

  private createHtmlElements(): HTMLElement {
    let $container = $(template)

    this.boxListContainerEl = $container.find(".js-boxlist-container").get(0)
    this.formContainerEl = $container.find(".js-form-container").get(0)
    this.nameEl = $container.find(".js-name").get(0) as HTMLInputElement
    this.loginEl = $container.find(".js-login").get(0) as HTMLInputElement
    this.spinnerEl = $container.find(".fa-spinner").get(0) as HTMLInputElement

    let btn = $container.find(".js-add-btn").get(0) as HTMLButtonElement
    btn.addEventListener("click", ev => {
      let name = this.nameEl.value.trim()
      let login = this.loginEl.value.trim()
      if (name.length < 4 || login.length < 4) {
        console.warn("Name and login should have at least 4 characters...")
        return
      }
      this.createContributor(name, login)
    })

    return $container.get(0)
  }

  private createChildComponents() {
    this.form = this.dash.create(ContributorForm, { args: [] })
    this.formContainerEl.appendChild(this.form.el)

    let params = {
      id: "contributorBoxList",
      name: "Contributors",
      sort: false
    }
    this.boxList = this.dash.create(BoxList, { args: [ params ] })
    this.boxListContainerEl.appendChild(this.boxList.el)
  }

  private listenToModel() {
    this.model.on("change", "dataFirst", data => {
      if (data.cmd !== "create" || data.type !== "Contributor")
        return
      let contributor = data.model as ContributorModel
      let box = this.createBoxFor(contributor)
      this.contributorMap.set(contributor.id, contributor)
      this.boxList.addBox(box)
    })
  }

  private listenToChildren() {
    this.dash.listenToChildren<ContributorModel>("contributorBoxSelected").call("dataFirst", data => {
      this.form.setContributor(data)
    })
  }

  private fillBoxList(contributors: ContributorModel[]) {
    contributors.forEach(c => {
      let box = this.createBoxFor(c)
      this.contributorMap.set(c.id, c)
      this.boxList.addBox(box)
    })
  }

  private createBoxFor(contributor: ContributorModel): ContributorBox {
    let box = this.dash.create(ContributorBox, { args: [ contributor ] })
    this.boxMap.set(contributor.id, box)
    return box
  }

  private async createContributor(name: string, login: string) {
    let frag = { name, login }
    try {
      await this.model.exec("create", "Contributor", frag as NewContributorFragment)
      this.nameEl.value = ""
      this.loginEl.value = ""
    } catch (err) {
      console.error("Unable to create new contributor...", err)
    }
    this.nameEl.focus()
  }

  /**
   * Hide the panel.
   */
  public hide() {
    this.el.style.display = "none"
  }

  /**
   * Make the panel visible.
   */
  public show() {
    this.el.style.display = "block"
  }
}
