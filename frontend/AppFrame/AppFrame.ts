import { Dash } from "bkb"
import { render } from "monkberry"
import App from "../App/App"
import HeaderBar from "../generics/HeaderBar/HeaderBar"
import StatusBar from "../generics/StatusBar/StatusBar"
import Sidebar from "./Sidebar/Sidebar"
import NavBtn, { NavBtnOptions } from "../generics/NavBtn/NavBtn";
import { DropdownMenu } from "../generics/DropdownMenu/DropdownMenu";

const template = require("./AppFrame.monk")

export default class AppFrame {
  readonly el: HTMLElement

  private view: MonkberryView

  constructor(private dash: Dash<App>) {
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

    let notifBtn = this.dash.create(NavBtn, {
      label: "Notifications",
      cssClass: ["WithIcon", "right", "notif"],
      canHaveAlert: true,
      clickHandler: ev => {
        console.log("Notifications to implement…") // TODO:
      }
    } as NavBtnOptions)
    bar.addMenuItem(notifBtn)


    let settingsBtn = this.dash.create(NavBtn, {
      label: "Settings",
      cssClass: ["WithIcon", "right", "settings"],
      clickHandler: ev => {
        console.log("Settings to implement…") // TODO:
      }
    } as NavBtnOptions)
    bar.addMenuItem(settingsBtn)

    // TODO: Add the menu 'Settings'
    // TODO: Add the menu 'Session'
    return bar
  }

  private createSettingsMenu() {
    let menu = this.dash.create(DropdownMenu)
    menu.addItems([
      {
        label: "New project",
        onClick: async () => this.dash.app.navigate("/new-project")
      },
      {
        label: "Steps",
        onClick: async () => this.dash.app.navigate("/settings/steps")
      },
      {
        label: "Contributors",
        onClick: async () => this.dash.app.navigate("/settings/contributors")
      },
      {
        label: "Flags",
        onClick: async () => this.dash.app.navigate("/settings/flags")
      },
      {
        label: "Search",
        onClick: async () => this.dash.app.navigate("/search")
      },
    ])
    // viewer.addWorkspace("/new-project", "dropdown", "New project", this.dash.create(ProjectForm, true))
    // viewer.addWorkspace("/settings/steps", "dropdown", "Manage steps", this.dash.create(StepWorkspace))
    // viewer.addWorkspace("/settings/contributors", "dropdown", "Contributors", this.dash.create(ContributorWorkspace))
    // viewer.addWorkspace("/settings/flags", "dropdown", "Flags", this.dash.create(FlagWorkspace))
    // viewer.addWorkspace("/search", "dropdown", "Search", this.dash.create(SearchWorkspace))
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
