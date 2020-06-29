import ErrorDialog from "@smallteam/shared-ui/modal-dialogs/ErrorDialog"
import InfoDialog from "@smallteam/shared-ui/modal-dialogs/InfoDialog"
import QuestionDialog from "@smallteam/shared-ui/modal-dialogs/QuestionDialog"
import { Log } from "bkb"
import handledom from "handledom"
import { OwnDash } from "../AppFrame/OwnDash"
import { WebhookModel } from "./WebhookWorkspace"

const template = handledom`
<tr>
  <td h="provider"></td>
  <td h="url"></td>
  <td> <button h="secret">Show secret</button> </td>
  <td> <button h="toggle"></button> </td>
  <td> <button h="delete">Delete</button> </td>
</tr>
`

export default class WebhookTableItem {
  readonly el: HTMLElement
  private providerEl: HTMLElement
  private urlEl: HTMLElement
  private btnSecretEl: HTMLButtonElement
  private btnToggleEl: HTMLButtonElement
  private btnDeleteEl: HTMLButtonElement

  private log: Log

  constructor(private dash: OwnDash, readonly webhook: WebhookModel) {
    this.log = this.dash.log

    const { root, ref } = template()

    this.el = root
    this.providerEl = ref("provider")
    this.urlEl = ref("url")
    this.btnSecretEl = ref("secret")
    this.btnToggleEl = ref("toggle")
    this.btnDeleteEl = ref("delete")

    this.providerEl.textContent = this.webhook.provider
    this.urlEl.textContent = this.webhook.url
    this.btnToggleEl.textContent = this.webhook.active ? "Deactivate" : "Activate"

    this.btnDeleteEl.addEventListener("click", () => this.dispatch("delete"))
    this.btnSecretEl.addEventListener("click", () => this.dispatch("showSecret"))
    this.btnToggleEl.addEventListener("click", () => this.dispatch("toggle"))
  }

  private dispatch(action: "showSecret" | "toggle" | "delete") {
    if (action === "showSecret")
      this.showWebhookSecret().catch(err => this.dash.log.error(err))
    else if (action === "toggle")
      this.toggleWebhook().catch(err => this.dash.log.error(err))
    else if (action === "delete")
      this.deleteWebhook().catch(err => this.dash.log.error(err))
    else
      this.log.warn(`Unknown action: ${action}`)
  }

  private async showWebhookSecret() {
    if (this.webhook.inProcessing) {
      // There is no need to wait for user response.
      this.log.info("Cannot perform this action now.")
      return
    }

    this.webhook.inProcessing = true
    try {
      const response = await fetch(`${this.dash.app.baseUrl}/api/notifications/github/get-webhook-secret`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ subscriptionId: this.webhook.id })
      })

      if (!response.ok)
        void this.dash.create(ErrorDialog).show("Something went wrong. Server did not fulfill our request.")
      else {
        const data = await response.json()
        if (!data.done)
          void this.dash.create(ErrorDialog).show("Something went wrong. Hook secret can't be displayed. Try again later.")
        else
          void this.dash.create(InfoDialog).show(data.secret, "Hook secret")
      }
    } catch (err) {
      void this.dash.create(ErrorDialog).show("Unable to reach server. Network error.")
    }
    this.webhook.inProcessing = false
  }

  private async toggleWebhook() {
    if (this.webhook.inProcessing) {
      // There is no need to wait for user response.
      void this.dash.create(InfoDialog).show("Cannot perform this action now.")
      return
    }

    this.webhook.inProcessing = true
    try {
      const action = this.webhook.active ? "deactivate-webhook" : "activate-webhook"
      const route = `${this.dash.app.baseUrl}/api/notifications/github/${action}`
      const response = await fetch(route, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ subscriptionId: this.webhook.id })
      })

      if (!response.ok)
        void this.dash.create(ErrorDialog).show("Something went wrong. The server did not fulfill the request.")
      else {
        const data = await response.json()
        if (!data.done)
          void this.dash.create(ErrorDialog).show("Something went wrong. Cannot perform this action now. Try again later.")
        else {
          this.webhook.active = !this.webhook.active
          this.btnToggleEl.textContent = this.webhook.active ? "Deactivate" : "Activate"
        }
      }
    } catch (err) {
      this.log.error("Unable to reach server. Network error.")
    }
    this.webhook.inProcessing = false
  }

  private async deleteWebhook() {
    if (!await this.dash.create(QuestionDialog).show("Do you really want to delete this hook?"))
      return

    if (this.webhook.inProcessing) {
      // There is no need to wait for user response.
      void this.dash.create(InfoDialog).show("Cannot perform this action now.")
      return
    }

    this.webhook.inProcessing = true
    try {
      const response = await fetch(`${this.dash.app.baseUrl}/api/notifications/github/delete-webhook`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ subscriptionId: this.webhook.id })
      })

      if (!response.ok)
        await this.dash.create(ErrorDialog).show("Something went wrong. Our server did not fulfill the request.")
      else {
        const data = await response.json()
        if (!data.done)
          void this.dash.create(ErrorDialog).show("Something went wrong. Cannot remove hook. Try again later.")
        else {
          this.el.hidden = true
          this.dash.emit("webhookDeleted", this.webhook.id)
        }
      }
    } catch (err) {
      void this.dash.create(ErrorDialog).show("Unable to reach server. Network error.")
    }
    this.webhook.inProcessing = false
  }
}
