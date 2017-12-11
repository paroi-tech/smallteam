import { Dash } from "bkb"
import { render } from "monkberry"
import App from "../../App/App"
import NavBtn, { NavBtnOptions } from "../../generics/NavBtn/NavBtn";
import { DropdownMenu, DropdownMenuOptions } from "../../generics/DropdownMenu/DropdownMenu";

// const manIcon = "\u{1F468}"

export default class SessionMenu {
  readonly menu: DropdownMenu

  constructor(private dash: Dash<App>) {
    let btn = dash.create(NavBtn, {
      label: dash.app.model.session.contributor.name
    } as NavBtnOptions)
    this.menu = dash.create(DropdownMenu, {
      btnEl: btn.el
    } as DropdownMenuOptions)
    // this.menu.setButtonContent(manIcon)
    this.addItemsToMenu()
  }

  private addItemsToMenu() {
    this.menu.entries.createNavBtn({
      label: "My profile",
      onClick: () => this.dash.app.navigate("/settings/my-profile")
    })
    this.menu.entries.createNavBtn({
      label: "Disconnect",
      onClick: () => this.dash.app.disconnect()
    })
  }
}
