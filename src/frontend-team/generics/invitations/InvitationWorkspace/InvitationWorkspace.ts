import { render } from "@tomko/lt-monkberry"
import { Dash, Log } from "bkb"
import { ErrorDialog } from "../../../../sharedFrontend/modalDialogs/modalDialogs"
import App from "../../../App/App"
import { Model } from "../../../AppModel/modelDefinitions"
import BoxList from "../../BoxList/BoxList"
import { ViewerController } from "../../WorkspaceViewer/WorkspaceViewer"
import InvitationBox from "../InvitationBox/InvitationBox"
import InvitationForm from "../InvitationForm/InvitationForm"

const template = require("./InvitationWorkspace.monk")

export interface Invitation {
  id: string
  creationTs: number
  expirationTs: number
  email: string
  username: string | undefined
}

export default class InvitationWorkspace {
  readonly el: HTMLElement
  private ctrl: ViewerController | undefined
  private model: Model
  private log: Log

  private form: InvitationForm
  private boxList: BoxList<InvitationBox>

  private map = new Map<string, Invitation>()

  private needFetch = true

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.form = this.dash.create(InvitationForm)
    this.boxList = this.dash.create(BoxList, {
      title: "Invitations",
      sort: false
    })

    let view = render(template)

    this.el = view.rootEl()
    view.ref("form").appendChild(this.form.el)
    view.ref("boxList").appendChild(this.boxList.el)

    this.fetchInvitations()
    this.dash.listenTo("invitationSent", invitation => this.addInvitation(invitation))
    this.dash.listenTo("resendInvitation", invitationId => this.resendInvitation(invitationId))
    this.dash.listenTo("cancelInvitation", invitationId => this.cancelInvitation(invitationId))
  }

  activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    ctrl.setContentEl(this.el).setTitle("Manage invitations")
    if (!this.needFetch)
      this.fetchInvitations().then(b => this.needFetch = b)
  }

  private async fetchInvitations() {
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/registration/fetch-invitations`, {
        method: "post",
        credentials: "include",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({})
      })

      if (!response.ok) {
        this.dash.create(ErrorDialog).show("Something went wrong. We can not get pending invitations from server.")
        return false
      }

      let answer = await response.json()

      for (let item of answer.data)
        this.addInvitation(item)
      return true
    } catch (error) {
      this.dash.create(ErrorDialog).show("We cannot reach our server. Check your internet connection.")
    }

    return false
  }

  private addInvitation(invitation: Invitation) {
    this.map.set(invitation.id, invitation)
    this.boxList.addBox(this.dash.create(InvitationBox, invitation))
  }

  private removeInvitation(invitationId: string) {
    this.map.delete(invitationId)
    this.boxList.removeBox(invitationId)
  }

  private async resendInvitation(invitationId: string) {
    let invitation = this.map.get(invitationId)
    if (!invitation) {
      this.log.error(`Invitation with ID ${invitationId} not found in InvitationWorkspace`)
      return
    }

    let msByDay = 24 * 3600 * 1000

    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/registration/resend-invitation`, {
        method: "post",
        credentials: "include",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          invitationId,
          username: invitation.username || undefined,
          email: invitation.email,
          validity: Math.floor((invitation.expirationTs - invitation.creationTs) / msByDay)
        })
      })

      if (!response.ok) {
        let dialog = this.dash.create(ErrorDialog)
        let logMsg = `Error while resending invitation. Response status: ${response.status} ${response.statusText}`

        await dialog.show("Something went wrong. The server did not handle the request correctly.")
        this.log.error(logMsg)
        return
      }

      let data = await response.json()

      this.removeInvitation(invitation.id)
      if (!data.done) {
        let dialog = this.dash.create(ErrorDialog)
        await dialog.show("There is a problem with the invitation. Try to create a new one.")
        return
      }
      this.addInvitation(data.invitation)
    } catch (error) {
      let dialog = this.dash.create(ErrorDialog)
      await dialog.show("Something went wrong. Network is not working properly.")
      this.log.error(error)
    }
  }

  private async cancelInvitation(invitationId: string) {
    let invitation = this.map.get(invitationId)
    if (!invitation) {
      this.log.error(`Invitation with ID ${invitationId} not dound in InvitationWorkspace`)
      return
    }

    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/registration/cancel-invitation`, {
        method: "post",
        credentials: "include",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ invitationId })
      })

      if (!response.ok) {
        let dialog = this.dash.create(ErrorDialog)
        let logMsg = `Error while canceling invitation. Response status: ${response.status} ${response.statusText}`
        await dialog.show("Something went wrong. The server did not handle the request correctly.")
        this.log.error(logMsg)
        return
      }

      let obj = await response.json()
      if (obj.done)
        this.removeInvitation(invitation.id)
    } catch (error) {
      let dialog = this.dash.create(ErrorDialog)
      await dialog.show("Something went wrong. Network is not working properly.")
      this.log.error(error)
    }
  }
}
