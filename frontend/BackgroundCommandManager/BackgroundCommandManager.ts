import * as $ from "jquery"
import { Dash } from "bkb"
import App from "../App/App"
import { Model } from "../AppModel/AppModel"
import { render } from "monkberry"
import { BgCommandManager, BgCommand } from "../AppModel/BgCommandManager"

import * as template from "./bgcmdmanager.monk"

export default class BackgroundCommandManager {
  readonly el: HTMLElement
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

    this.buttonEl = document.createElement("button")
    this.buttonEl.textContent = "Bg"
    this.buttonEl.style.padding = "5px"
    this.buttonEl.addEventListener("click", ev => this.show())

    this.listenToModel()
  }

  private createHtmlElements(): HTMLElement {
    let el = document.createElement("dialog")

    el.classList.add("BgCommandManager")
    this.view = render(template, el)
    this.closeButtonEl = this.view.querySelector(".js-close-button")
    this.closeButtonEl.addEventListener("click", ev => this.hide())
    this.errorTableEl = this.view.querySelector(".js-error-table")
    this.progressTableEl = this.view.querySelector(".js-progress-table")

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
    let d = this.el as any
    d.showModal()
  }

  private hide() {
    document.body.removeChild(this.el)
    let d = this.el as any
    d.close()
  }
}
