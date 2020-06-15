import { render } from "@tomko/lt-monkberry"
import { Log } from "bkb"
import { ErrorDialog } from "../../../../shared-ui/modalDialogs/modalDialogs"
import { OwnDash } from "../../App/OwnDash"
import { ViewerController } from "../WorkspaceViewer/WorkspaceViewer"
import WebhookTableItem from "./WebhookTableItem/WebhookTableItem"

export interface WebhookModel {
  id: string
  url: string
  provider: string
  active: boolean
  inProcessing: boolean
}

const template = require("./WebhookWorkspace.monk")

export default class WebhookWorkspace {
  readonly el: HTMLElement
  private tableEl: HTMLTableElement
  private btnEl: HTMLButtonElement

  private ctrl: ViewerController | undefined
  private log: Log

  private itemMap = new Map<string, WebhookTableItem>()

  private needFetch = true

  constructor(private dash: OwnDash) {
    this.log = this.dash.log

    let view = render(template)

    this.el = view.rootEl()
    this.tableEl = view.ref("table")
    this.btnEl = view.ref("add")

    this.btnEl.addEventListener("click", () => this.createWebhook())
    this.dash.listenTo("webhookDeleted", data => {
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
      this.fetchWebhooks().then(b => this.needFetch = b)
  }

  private async fetchWebhooks() {
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/notifications/github/fetch-webhooks`, {
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

      this.processHooks(data.webhooks)

      return true
    } catch (err) {
      this.log.error("Unable to get list of hooks from server. Network error.")
    }

    return false
  }

  private processHooks(webhooks: WebhookModel[]) {
    for (let w of webhooks) {
      w.inProcessing = false
      this.addHookToTable(w)
    }
  }

  private addHookToTable(webhook: WebhookModel) {
    let item = this.dash.create(WebhookTableItem, webhook)

    this.itemMap.set(webhook.id, item)
    this.tableEl.tBodies[0].appendChild(item.el)
  }

  private async createWebhook() {
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/notifications/github/create-webhook`, {
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
        this.log.error("Something went wrong. Cannot create webhook. Try again later.")
        return
      }
      data.webhook.inProcessing = false
      this.addHookToTable(data.webhook)
    } catch (err) {
      this.log.error("Unable to get list of webhooks from server. Network error.")
    }
  }
}
