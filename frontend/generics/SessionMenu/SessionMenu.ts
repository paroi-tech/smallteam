import { Dash } from "bkb"
import { render } from "monkberry"
import { MenuItem } from "../Menu/Menu"
import { DropdownMenu, Alignment } from "../DropdownMenu/DropdownMenu"
import { create } from "domain";

const template = require("./SessionMenu.monk")

export default class SessionMenu {
  readonly el: HTMLElement
  private menu: DropdownMenu

  private view: MonkberryView

  constructor(private dash: Dash, align: Alignment) {
    this.el = this.createView()
    this.menu = this.dash.create(DropdownMenu, align, this.dash.app.model.session.contributor.name)
    this.el.appendChild(this.menu.el)
    this.addItemsToMenu()
    this.listenToEvents()
  }

  private createView() {
    this.view = render(template, document.createElement("div"))

    return this.view.nodes[0] as HTMLElement
  }

  private addItemsToMenu() {
    this.menu.addItem({
      id: "editProfile",
      label: "My profile"
    })
    this.menu.addItem({
      id: "disconnect",
      label: "Disconnect"
    })
  }

  private listenToEvents() {
    this.dash.listenTo(this.menu, "select").onData(async itemId => {
      if (itemId === "editProfile")
        await this.dash.emit("select", "/settings/my-profile")
      else if (itemId === "disconnect")
        await this.dash.app.disconnect()
    })
  }
}
