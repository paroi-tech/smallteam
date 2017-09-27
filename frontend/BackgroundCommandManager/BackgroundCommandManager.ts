import * as $ from "jquery"
import { Dash } from "bkb"
import App from "../App/App"
import { render } from "monkberry"

import * as template from "./projectform.monk"

export default class BackgroundCommandManager {
  readonly el: HTMLElement

  private errorTableEl: HTMLTableElement
  private progressTableEl: HTMLTableElement

  private view: MonkberryView

  constructor(private dash: Dash<App>) {
    this.el = this.createHtmlElements()
  }

  private createHtmlElements(): HTMLElement {
    let el = document.createElement("div")

    this.view = render(template, el)
    this.errorTableEl = this.view.querySelector(".js-error-table")
    this.progressTableEl = this.view.querySelector(".js-progress-table")

    return el
  }
}
