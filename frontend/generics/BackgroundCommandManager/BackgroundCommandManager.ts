import { Dash } from "bkb"
import { render } from "monkberry"
import { BgCommandManager, BgCommand } from "../../AppModel/BgCommandManager";
import { Model } from "../../AppModel/AppModel";
import App from "../../App/App";

const template = require("./BackgroundCommandManager.monk")
const templateMenuBtn = require("./MenuBtn.monk")

export default class BackgroundCommandManager {
  readonly el: HTMLDialogElement
  readonly buttonEl: HTMLButtonElement

  private tableEl: HTMLTableElement
  private closeButtonEl: HTMLButtonElement

  private bgCmdManager: BgCommandManager
  private model: Model

  private view: MonkberryView

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.bgCmdManager = this.dash.app.model.bgManager
    this.el = this.createHtmlElements()
    this.buttonEl = this.createHtmlMenuButtonElement()
    this.listenToModel()
  }

  private createHtmlMenuButtonElement(): HTMLButtonElement {
    this.view = render(templateMenuBtn, document.createElement("div"))
    let btnEl = this.view.nodes[0] as HTMLButtonElement
    btnEl.addEventListener("click", ev => {
      btnEl.style.backgroundColor = "transparent"
      this.show()
    })
    return btnEl
  }

  private createHtmlElements(): HTMLDialogElement {
    this.view = render(template, document.createElement("div"))
    let el = this.view.nodes[0] as HTMLDialogElement
    this.closeButtonEl = el.querySelector(".js-close-button") as HTMLButtonElement
    this.closeButtonEl.addEventListener("click", ev => this.hide())
    this.tableEl = el.querySelector(".js-table") as HTMLTableElement
    document.body.appendChild(el)
    return el
  }

  private listenToModel() {
    this.dash.listenTo<BgCommand>(this.model, "bgCommandError").onData(bgCmd => {
      this.buttonEl.style.backgroundColor = "orange"

      let row = this.tableEl.tBodies[0].insertRow(-1)
      row.insertCell(-1).textContent = bgCmd.label
      row.insertCell(-1).textContent = bgCmd.startDt.toLocaleTimeString()

      let progressCheckBox = document.createElement("input")
      progressCheckBox.setAttribute("type", "checkbox")
      progressCheckBox.disabled = true
      progressCheckBox.checked = bgCmd.done ? true : false
      row.insertCell(-1).appendChild(progressCheckBox)

      let doneCheckBox = document.createElement("input")
      doneCheckBox.setAttribute("type", "checkbox")
      doneCheckBox.disabled = true
      doneCheckBox.checked = bgCmd.done ? true : false
      row.insertCell(-1).appendChild(doneCheckBox)
    })
  }

  private show() {
    this.el.showModal()
  }

  private hide() {
    this.el.close()
  }
}
