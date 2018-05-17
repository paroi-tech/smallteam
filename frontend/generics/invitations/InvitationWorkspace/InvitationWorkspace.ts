import config from "../../../../isomorphic/config"
import { Dash, Log } from "bkb"
import { Model } from "../../../AppModel/modelDefinitions"
import { Workspace, ViewerController } from "../../WorkspaceViewer/WorkspaceViewer"
import { render } from "@fabtom/lt-monkberry"
import BoxList from "../../BoxList/BoxList"
import InvitationForm from "../InvitationForm/InvitationForm"
import InvitationBox from "../InvitationBox/InvitationBox"
import ErrorDialog from "../../modal-dialogs/ErrorDialog/ErrorDialog"

const template = require("./InvitationWorkspace.monk")

export default class InvitationWorkspace {
  readonly el: HTMLElement
  private ctrl: ViewerController | undefined
  private model: Model
  private log: Log

  private form: InvitationForm
  private boxList: BoxList<InvitationBox>

  private map = new Map<string, Invitation>()

  constructor(private dash: Dash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    this.form = this.dash.create(InvitationForm)
    this.boxList = this.dash.create(BoxList, {
      name: "Invitations",
      sort: "false"
    })

    let view = render(template)
    this.el = view.rootEl()
    view.ref("form").appendChild(this.form.el)
    view.ref("boxList").appendChild(this.boxList.el)

    this.fetchInvitations()
    this.dash.listenTo("invitationSent", invitationId => this.addInvitation(invitationId))
    this.dash.listenTo("resendInvitation", invitationId => this.resendInvitation(invitationId))
    this.dash.listenTo("cancelInvitation", invitationId => this.cancelInvitation(invitationId))
  }

  public activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    ctrl.setContentEl(this.el).setTitle("Manage invitations")
  }

  public deactivate() {
  }

  private async fetchInvitations() {
    try {
      let response = await fetch(`${config.urlPrefix}/api/registration/fetch-invitations`, {
        method: "post",
        credentials: "include",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({})
      })
      if (!response.ok) {
        await this.dash.create(ErrorDialog).show("Unable to retrieve pending invitations from server.")
        return
      }

      let answer = await response.json()
      for (let item of answer.data)
        this.addInvitation(item)
    } catch (error) {
      await this.dash.create(ErrorDialog).show("Something went wrong. We can get pending invitations for the moment.")
      this.log.error(error)
    }
  }

  private addInvitation(invitation: Invitation) {
    this.map.set(invitation.id, invitation)
    let box = this.dash.create(InvitationBox, invitation)
    this.boxList.addBox(box)
  }

  private resendInvitation(invitationId: string) {

  }

  private cancelInvitation(invitationId: string) {

  }
}
