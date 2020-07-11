import ErrorDialog from "@smallteam-local/shared-ui/modal-dialogs/ErrorDialog"
import { Log } from "bkb"
import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { AccountModel, Model } from "../../AppModel/AppModel"
import ImagePicker from "../../generics/ImagePicker"
import { ViewerController, Workspace } from "../../generics/WorkspaceViewer"
import AccountForm from "./AccountForm"
import PasswordForm from "./PasswordForm"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.AccountHome {
  &-avatarArea {
    align-items: center;
    display: flex;
    justify-content: center;
  }
}
`

const template = handledom`
<div class="AccountHome">
  <div h="formContainer"></div>
  <div h="pwdArea"></div>
  <h1 class="TitleBar">Change your profile picture</h1>
  <div class="AccountHome-avatarArea" h="avatarArea"></div>
</div>
`

export default class AccountHome implements Workspace {
  readonly el: HTMLElement

  private log: Log
  private model: Model
  private picker: ImagePicker

  constructor(private dash: OwnDash, private account: AccountModel) {
    this.log = this.dash.app.log
    this.model = this.dash.app.model

    const { root, ref } = template()

    this.el = root
    this.picker = this.dash.create(ImagePicker, { width: 128, height: 128 })
    this.dash.listenTo(this.picker, "changed", data => this.onAvatarChange(data))

    const form = this.dash.create(AccountForm, false)
    const passwdForm = this.dash.create(PasswordForm, this.account)

    form.setAccount(this.account)
    ref("formContainer").appendChild(form.el)
    ref("pwdArea").appendChild(passwdForm.el)
    ref("avatarArea").appendChild(this.picker.el)

    this.setPickerToAccountAvatar()
  }

  activate(ctrl: ViewerController) {
    ctrl.setTitle("Personal space").setContentEl(this.el)
  }

  // deactivate() {
  // }

  private setPickerToAccountAvatar() {
    const avatar = this.model.session.account.avatar

    if (avatar) {
      const variant = avatar.getVariant("orig")
      if (variant)
        this.picker.setImage(`url(${variant.url})`)
    }
  }

  private async onAvatarChange(data) {
    const accountId = this.dash.app.model.session.account.id
    const meta = {
      ref: {
        type: "accountAvatar",
        id: accountId
      },
      overwrite: true
    }
    const fd = new FormData()

    fd.append("f", data.f)
    fd.append("meta", JSON.stringify(meta))
    try {
      const response = await fetch(`${this.dash.app.baseUrl}/medias/upload`, {
        method: "post",
        credentials: "same-origin",
        body: fd
      })

      if (!response.ok) {
        void this.dash.create(ErrorDialog).show("Something went wrong. Try to change avatar later.")
        this.log.error("Unable to change avatar", response.statusText)
        this.setPickerToAccountAvatar()
      } else {
        const result = await response.json()

        if (result.modelUpd)
          this.model.processModelUpdate(result.modelUpd)
        if (result.done)
          this.log.info("Avatar successfully updloaded.")
        else
          this.log.error("Error while uploading image.")
      }
    } catch (err) {
      void this.dash.create(ErrorDialog).show("Unable to change avatar. Network error.")
      this.log.error("Unable to change avatar", err)
    }

    this.setPickerToAccountAvatar()
  }
}
