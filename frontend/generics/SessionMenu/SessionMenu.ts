import { Dash } from "bkb"
import { render } from "monkberry"
import { MenuItem } from "../Menu/Menu"
import { DropdownMenu, Alignment } from "../DropdownMenu/DropdownMenu"

const manIcon = "\u{1F468}"

export default class SessionMenu {
  private menu: DropdownMenu

  constructor(private dash: Dash, align: Alignment) {
    this.menu = this.dash.create(DropdownMenu, align)
    this.menu.setButtonContent(manIcon)
    this.addItemsToMenu()
  }

  private addItemsToMenu() {
    this.menu.addItem({
      id: "editProfile",
      label: "Edit my profile"
    })
    this.menu.addItem({
      id: "disconnect",
      label: "Disconnect"
    })
  }

  private listenToEvents() {
    this.dash.listenTo(this.menu, "select").onData(async itemId => {
      if (itemId === "editProfile")
        await this.dash.app.navigate("/settings/contributors/my-profile")
      else if (itemId === "disconnect") {
        // TODO: Disconnect user.
      }
    })
  }

  get el(): HTMLElement {
    return this.menu.el;
  }
}
