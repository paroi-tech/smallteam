import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry";
import { BgCommandManager, BgCommand } from "../../AppModel/BgCommandManager"
import { Model } from "../../AppModel/AppModel"
import App from "../../App/App"
import { OwnDash } from "../../App/OwnDash";

const template = require("./BackgroundCommandManager.monk")
const templateMenuBtn = require("./MenuBtn.monk")

export default class BackgroundCommandManager {
  private el: HTMLDialogElement
  readonly buttonEl: HTMLButtonElement
  private tableEl: HTMLTableElement

  private bgCmdManager: BgCommandManager
  private model: Model

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.bgCmdManager = this.dash.app.model.bgManager

    let view = render(template)
    this.el = view.rootEl()
    document.body.appendChild(this.el)

    view.ref("closeBtn").addEventListener("click", ev => this.hide())
    this.tableEl = view.ref("table")
    this.buttonEl = this.createHtmlMenuButtonElement()

    this.dash.listenToModel<BgCommand>("bgCommandError", bgCmd => this.onBgCommandError(bgCmd))
  }

  public show() {
    this.el.showModal()
  }

  public hide() {
    if (this.el.open)
      this.el.close()
  }

  // --
  // -- Utilities
  // --

  private createHtmlMenuButtonElement(): HTMLButtonElement {
    let view = render(templateMenuBtn)
    let btnEl = view.rootEl() as HTMLButtonElement

    btnEl.addEventListener("click", ev => {
      btnEl.style.backgroundColor = "transparent"
      this.show()
    })

    return btnEl
  }

  // --
  // -- Event handlers
  // --

  private onBgCommandError(cmd: BgCommand) {
    this.buttonEl.style.backgroundColor = "orange"

    let row = this.tableEl.tBodies[0].insertRow(-1)

    row.insertCell(-1).textContent = cmd.label
    row.insertCell(-1).textContent = cmd.startDt.toLocaleTimeString()

    let progressCheckBox = document.createElement("input")

    progressCheckBox.setAttribute("type", "checkbox")
    progressCheckBox.disabled = true
    progressCheckBox.checked = cmd.done ? true : false
    row.insertCell(-1).appendChild(progressCheckBox)

    let doneCheckBox = document.createElement("input")

    doneCheckBox.setAttribute("type", "checkbox")
    doneCheckBox.disabled = true
    doneCheckBox.checked = cmd.done ? true : false
    row.insertCell(-1).appendChild(doneCheckBox)
  }
}
