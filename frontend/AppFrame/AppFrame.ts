import { Dash } from "bkb"
import { render } from "monkberry"
import HeaderBar from "../generics/HeaderBar/HeaderBar"
import StatusBar from "../generics/StatusBar/StatusBar"
import Sidebar from "../generics/Sidebar/Sidebar"

const template = require("./AppFrame.monk")

export default class AppFrame {
  readonly el: HTMLElement

  private view: MonkberryView

  constructor(private dash: Dash) {
    this.el = this.createView()
  }

  private createView() {
    let el = document.createElement("div")
    this.view = render(template, el)

    let topEl =  this.el.querySelector(".js-top") as HTMLElement
    topEl.appendChild(this.createHeaderBar().el)

    let bottomEl =  this.el.querySelector(".js-bottom") as HTMLElement
    bottomEl.appendChild(this.createStatusBar().el)

    let sideEl =  this.el.querySelector(".js-side") as HTMLElement
    sideEl.appendChild(this.createSidebar().el)

    return el
  }

  private createHeaderBar() {
    let bar = this.dash.create(HeaderBar)
    // TODO: Add the menu 'Settings'
    // TODO: Add the menu 'Session'
    return bar
  }

  private createStatusBar() {
    let bar = this.dash.create(StatusBar)
    // TODO: Fill with background tasks
    return bar
  }

  private createSidebar() {
    let bar = this.dash.create(Sidebar)
    return bar
  }
}
