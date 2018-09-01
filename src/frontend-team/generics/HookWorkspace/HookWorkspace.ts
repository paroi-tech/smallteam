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

// TODO: Only invitations and hooks when workspace is displayed.

export default class HookWorkspace {
  readonly el: HTMLElement
  private tableEl: HTMLTableElement
  private btnEl: HTMLButtonElement

  private ctrl: ViewerController | undefined
  private model: Model
  private log: Log

  private itemMap = new Map<string, HookTableItem>()

  private needFetch = true

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
  }

  activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    this.ctrl.setContentEl(this.el).setTitle("Github subscriptions")
    if (this.needFetch)
      this.fetchHooks().then(b => this.needFetch = b)
  }

  deactivate() {
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
        this.dash.create(ErrorDialog).show("Something went wrong. The server did not fulfill the request.")
        return false
      }

      let data = await response.json()

      if (!data.done) {
        this.dash.create(ErrorDialog).show("Something went wrong. We can not display hooks. Try again later.")
        return false
      }

      this.processHooks(data.hooks)
      return true
    } catch (err) {
      this.log.error("Unable to get list of hooks from server. Network error.")
    }

    return false
  }

  private processHooks(hooks: HookModel[]) {
    for (let hook of hooks) {
      hook.inProcessing = false
      this.addHookToTable(hook)
    }
  }

  private addHookToTable(hook: HookModel) {
    let item = this.dash.create(HookTableItem, hook)

    this.itemMap.set(hook.id, item)
    this.tableEl.tBodies[0].appendChild(item.el)
  }

  private async createHook() {
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/notifications/github/create-hook`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({})
      })

      if (!response.ok) {
        this.dash.create(ErrorDialog).show("Something went wrong. Server did not fulfill our request.")
        return
      }

      let data = await response.json()

      if (!data.done) {
        this.log.error("Something went wrong. Cannot create hook. Try again later.")
        return
      }
      data.hook.inProcessing = false
      this.addHookToTable(data.hook)
    } catch (err) {
      this.log.error("Unable to get list of hooks from server. Network error.")
    }
  }
}
