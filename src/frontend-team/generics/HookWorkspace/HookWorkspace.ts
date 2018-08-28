import { OwnDash } from "../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"
import HookTableItem from "./HookTableItem/HookTableItem"
import { ErrorDialog } from "../../../sharedFrontend/modalDialogs/modalDialogs"
import { ViewerController } from "../WorkspaceViewer/WorkspaceViewer"
import { Model } from "../../AppModel/AppModel"
import { Log } from "bkb"

export interface HookModel {
  id: string
  url: string
  provider: string
  active: boolean
  inProcessing: boolean
}

const template = require("./HookWorkspace.monk")

export default class HookWorkspace {
  readonly el: HTMLElement
  private tableEl: HTMLTableElement
  private btnEl: HTMLButtonElement

  private ctrl: ViewerController | undefined
  private model: Model
  private log: Log

  private itemMap = new Map<string, HookTableItem>()

  constructor(private dash: OwnDash) {
    this.log = this.dash.log
    this.model = this.dash.app.model

    let view = render(template)

    this.el = view.rootEl()
    this.tableEl = view.ref("table")
    this.btnEl = view.ref("add")

    this.btnEl.addEventListener("click", ev => this.createHook())
    this.dash.listenTo("hookDeleted", data => {
      let item = this.itemMap.get(data)

      if (item) {
        this.tableEl.tBodies[0].removeChild(item.el)
        this.itemMap.delete(data)
      }
    })

    this.fetchHooks()
  }

  public activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    this.ctrl.setContentEl(this.el).setTitle("Manage invitations")
  }

  public deactivate() {
  }

  private async fetchHooks() {
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/notifications/github/fetch-hooks`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({})
      })

      if (!response.ok) {
        this.log.error("Something went wrong. Server did not fulfill our request.")
        return
      }

      let data = await response.json()

      if (!data.done) {
        this.log.error("Something went wrong. We can not display hooks. Try again later.")
        return
      }

      for (let hook of data.hooks) {
        hook.inProcessing = false
        this.addHookToTable(hook)
      }
    } catch (err) {
      this.log.error("Unable to get list of hooks from server. Network error.")
    }
  }

  private addHookToTable(hook: HookModel) {
    let item = this.dash.create(HookTableItem, hook)

    this.itemMap.set(hook.id, item)
    this.tableEl.tBodies[0].appendChild(item.el)
  }

  private async createHook() {

  }
}
