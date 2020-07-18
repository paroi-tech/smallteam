import handledom from "handledom"
import { OwnDash } from "../AppFrame/OwnDash"
import { Model } from "../AppModel/AppModel"
import { BgCommand, BgCommandManager } from "../AppModel/BgCommandManager"
import { Dialog, DialogOptions } from "./Dialog"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
@import "../shared-ui/theme/definitions";

.BgCommandManagerBtn {
  color: #7689AF;
  font-size: $f13;
  padding: 5px;
}

.BgCommandManager {
  min-width: 500px;

  &-table {
    margin: 5px auto;
    width: 95%;
    caption {
      font-size: $f18;
      font-weight: bold;
    }
    thead {
      font-weight: bold;
    }
    td {
      padding: 5px;
    }
    tr {
      border-bottom: 1px #ccc solid;
    }
  }
}
`

const template = handledom`
<div class="BgCommandManager">
  <table class="BgCommandManager-table" h="table">
    <thead>
      <tr>
        <td>Label</td>
        <td>Start date</td>
        <td>In progress</td>
        <td>Done</td>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</div>
`
const templateMenuBtn = handledom`
<button class="BgCommandManagerBtn">Background tasks</button>
`

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

    const { root, ref } = template()

    this.el = root
    this.tableEl = ref("table")
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
    const { root } = templateMenuBtn()
    const btnEl = root as HTMLButtonElement

    btnEl.addEventListener("click", () => this.dialog.open())

    return btnEl
  }

  // --
  // -- Event handlers
  // --

  private onBgCommandError(cmd: BgCommand) {
    this.buttonEl.style.backgroundColor = "orange"

    const row = this.tableEl.tBodies[0].insertRow()

    row.insertCell().textContent = cmd.label
    row.insertCell().textContent = cmd.startDt.toLocaleTimeString()

    const progressCheckBox = document.createElement("input")

    progressCheckBox.setAttribute("type", "checkbox")
    progressCheckBox.disabled = true
    progressCheckBox.checked = cmd.done ? true : false
    row.insertCell().appendChild(progressCheckBox)

    const doneCheckBox = document.createElement("input")

    doneCheckBox.setAttribute("type", "checkbox")
    doneCheckBox.disabled = true
    doneCheckBox.checked = cmd.done ? true : false
    row.insertCell().appendChild(doneCheckBox)
  }
}
