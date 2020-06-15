import { render } from "@tomko/lt-monkberry"
import { OwnDash } from "../../App/OwnDash"
import { Model } from "../../AppModel/AppModel"
import { BgCommand, BgCommandManager } from "../../AppModel/BgCommandManager"
import { Dialog, DialogOptions } from "../Dialog/Dialog"

const template = require("./BackgroundCommandManager.monk")
const templateMenuBtn = require("./MenuBtn.monk")

export default class BackgroundCommandManager {
  readonly buttonEl: HTMLButtonElement
  readonly el: HTMLElement
  private tableEl: HTMLTableElement
  private dialog: Dialog<BackgroundCommandManager>

  private bgCmdManager: BgCommandManager
  private model: Model

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.bgCmdManager = this.dash.app.model.bgManager

    let view = render(template)

    this.el = view.rootEl()
    this.tableEl = view.ref("table")
    this.buttonEl = this.createHtmlMenuButtonElement()

    this.dialog = this.dash.create<Dialog<BackgroundCommandManager>, DialogOptions<BackgroundCommandManager>>(Dialog, {
      title: "Background Tasks",
      content: this
    })

    this.dash.listenToModel<BgCommand>("bgCommandError", bgCmd => this.onBgCommandError(bgCmd))
  }

  // --
  // -- Utilities
  // --

  private createHtmlMenuButtonElement(): HTMLButtonElement {
    let view = render(templateMenuBtn)
    let btnEl = view.rootEl() as HTMLButtonElement

    btnEl.addEventListener("click", () => this.dialog.open())

    return btnEl
  }

  // --
  // -- Event handlers
  // --

  private onBgCommandError(cmd: BgCommand) {
    this.buttonEl.style.backgroundColor = "orange"

    let row = this.tableEl.tBodies[0].insertRow()

    row.insertCell().textContent = cmd.label
    row.insertCell().textContent = cmd.startDt.toLocaleTimeString()

    let progressCheckBox = document.createElement("input")

    progressCheckBox.setAttribute("type", "checkbox")
    progressCheckBox.disabled = true
    progressCheckBox.checked = cmd.done ? true : false
    row.insertCell().appendChild(progressCheckBox)

    let doneCheckBox = document.createElement("input")

    doneCheckBox.setAttribute("type", "checkbox")
    doneCheckBox.disabled = true
    doneCheckBox.checked = cmd.done ? true : false
    row.insertCell().appendChild(doneCheckBox)
  }
}
