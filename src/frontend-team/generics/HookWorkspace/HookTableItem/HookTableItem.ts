import { OwnDash } from "../../../App/OwnDash"
import { render } from "@fabtom/lt-monkberry"
import { HookModel } from "../HookWorkspace"
import { Log } from "bkb"
import { InfoDialog, ErrorDialog } from "../../../../sharedFrontend/modalDialogs/modalDialogs"

const template = require("./HookTableItem.monk")

export default class HookTableItem {
  readonly el: HTMLElement
  private providerEl: HTMLElement
  private urlEl: HTMLElement
  private btnSecretEl: HTMLButtonElement
  private btnToggleEl: HTMLButtonElement
  private btnDeleteEl: HTMLButtonElement

  private log: Log

  constructor(private dash: OwnDash, readonly hook: HookModel) {
    this.log = this.dash.log
    let view = render(template)

    this.el = view.rootEl()
    this.providerEl = view.ref("provider")
    this.urlEl = view.ref("url")
    this.btnSecretEl = view.ref("secret")
    this.btnToggleEl = view.ref("toggle")
    this.btnDeleteEl = view.ref("delete")

    this.providerEl.textContent = this.hook.provider
    this.urlEl.textContent = this.hook.url
    this.btnToggleEl.textContent = this.hook.active ? "Deactivate" : "Activate"

    this.btnDeleteEl.addEventListener("click", ev => this.dispatch("delete"))
    this.btnSecretEl.addEventListener("click", ev => this.dispatch("showSecret"))
    this.btnToggleEl.addEventListener("click", ev => this.dispatch("toggle"))
  }

  private dispatch(action: "showSecret" | "toggle" | "delete") {
    if (this.hook.inProcessing)
      this.log.info("Cannot perform this action now...")
    else if (action === "showSecret")
      this.showHookSecret()
    else if (action === "toggle")
      this.toggleHook()
    else if (action === "delete")
      this.deleteHook()
    else
      this.log.warn(`Unknown action: ${action}`)
  }

  private async showHookSecret() {
    this.hook.inProcessing = true

    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/notifications/github/get-secret`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ subscriptionId: this.hook.id })
      })

      // IMPORTANT: We don't need to wait for the user confirmation on the dialogs we will display.

      if (!response.ok)
        this.dash.create(ErrorDialog).show("Something went wrong. Server did not fulfill our request.")
      else {
        let data = await response.json()
        if (!data.done)
          this.dash.create(ErrorDialog).show("Something went wrong. Hook secret can't be displayed. Try again later.")
        else
          this.dash.create(InfoDialog).show(data.secret, "Hook secret")
      }
    } catch (err) {
      this.dash.create(ErrorDialog).show("Unable to reach server. Network error.")
    }

    this.hook.inProcessing = false
  }

  private async toggleHook() {
    this.hook.inProcessing = true

    try {
      let action = this.hook.active ? "deactivate-hook" : "activate-hook"
      let route = `${this.dash.app.baseUrl}/api/notifications/github/${action}`
      let response = await fetch(route, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ subscriptionId: this.hook.id })
      })

      if (!response.ok)
        this.dash.create(ErrorDialog).show("Something went wrong. The server did not fulfill the request.")
      else {
        let data = await response.json()
        if (!data.done)
          this.dash.create(ErrorDialog).show("Something went wrong. Cannot perform this action now. Try again later.")
        else {
          this.hook.active = !this.hook.active
          this.btnToggleEl.textContent = this.hook.active ? "Deactivate" : "Activate"
        }
      }
    } catch (err) {
      this.log.error("Unable to reach server. Network error.")
    }

    this.hook.inProcessing = false
  }

  private async deleteHook() {
    this.hook.inProcessing = true

    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/notifications/github/delete-hook`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ subscriptionId: this.hook.id })
      })

      if (!response.ok)
        await this.dash.create(ErrorDialog).show("Something went wrong. Our server did not fulfill the request.")
      else {
        let data = await response.json()
        if (!data.done)
        this.log.error("Something went wrong. Cannot perform this action now. Try again later.")
        else {
          this.hook.active = !this.hook.active
          this.btnToggleEl.textContent = this.hook.active ? "Deactivate" : "Activate"
        }
      }
    } catch (err) {
      this.dash.create(ErrorDialog).show("Unable to reach server. Network error.")
    }

    this.hook.inProcessing = false
    this.el.hidden = true
    this.dash.emit("hookDeleted")
  }
}
