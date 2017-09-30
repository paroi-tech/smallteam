import * as $ from "jquery"
import { Dash } from "bkb"
import App from "../App/App"
import { Model } from "../AppModel/AppModel"
import { render } from "monkberry"
import { BgCommandManager, BgCommand } from "../AppModel/BgCommandManager"

import * as template from "./bgcmdmanager.monk"
import * as templateMenuBtn from "./menubutton.monk"

export default class BackgroundCommandManager {
  readonly el: HTMLDialogElement
  readonly buttonEl: HTMLButtonElement

  private errorTableEl: HTMLTableElement
  private progressTableEl: HTMLTableElement
  private closeButtonEl: HTMLButtonElement

  private bgCmdManager: BgCommandManager
  private model: Model

  private view: MonkberryView

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.bgCmdManager = this.dash.app.model.bgCommandMng
    this.el = this.createHtmlElements()
    this.buttonEl = this.createHtmlMenuButtonElement()
    this.listenToModel()
  }

  private createHtmlMenuButtonElement(): HTMLButtonElement {
    this.view = render(templateMenuBtn, document.createElement("div"))
    let btnEl = this.view.nodes[0] as HTMLButtonElement
    btnEl.addEventListener("click", ev => this.show())
    return btnEl
  }

  private createHtmlElements(): HTMLDialogElement {
    this.view = render(template, document.createElement("div"))
    let el = this.view.nodes[0] as HTMLDialogElement
    this.closeButtonEl = el.querySelector(".js-close-button") as HTMLButtonElement
    this.closeButtonEl.addEventListener("click", ev => this.hide())
    this.errorTableEl = el.querySelector(".js-error-table") as HTMLTableElement
    this.progressTableEl = el.querySelector(".js-progress-table") as HTMLTableElement
    return el
  }

  private listenToModel() {
    this.dash.listenTo<BgCommand>(this.model, "bgCommandAdded").onData(bgCmd => {
      this.buttonEl.style.backgroundColor = "skyblue"
    })
    document.body.appendChild(this.el)
  }

  private show() {
    document.body.appendChild(this.el)
    this.el.showModal()
  }

  private hide() {
    document.body.removeChild(this.el)
    this.el.close()
  }
}
