import { Log } from "bkb"
import handledom from "handledom"
import ErrorDialog from "../../../../shared-ui/modal-dialogs/ErrorDialog"
import { OwnDash } from "../../AppFrame/OwnDash"
import { AccountModel, Model } from "../../AppModel/AppModel"
import ImagePicker from "../../generics/ImagePicker"
import { ViewerController, Workspace } from "../../generics/WorkspaceViewer"
import AccountForm from "./AccountForm"
import PasswordForm from "./PasswordForm"

// tslint:disable-next-line: no-unused-expression
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

    let form = this.dash.create(AccountForm, false)
    let passwdForm = this.dash.create(PasswordForm, this.account)

    form.setAccount(this.account)
    ref("formContainer").appendChild(form.el)
    ref("pwdArea").appendChild(passwdForm.el)
    ref("avatarArea").appendChild(this.picker.el)

    this.setPickerToAccountAvatar()
  }

  activate(ctrl: ViewerController) {
    ctrl.setTitle("Personal space").setContentEl(this.el)
  }

  deactivate() {
  }

  private setPickerToAccountAvatar() {
    let avatar = this.model.session.account.avatar

    if (avatar) {
      let variant = avatar.getVariant("orig")
      if (variant)
        this.picker.setImage(`url(${variant.url})`)
    }
  }

  private async onAvatarChange(data) {
    let accountId = this.dash.app.model.session.account.id
    let meta = {
      ref: {
        type: "accountAvatar",
        id: accountId
      },
      overwrite: true
    }
    let fd = new FormData()

    fd.append("f", data.f)
    fd.append("meta", JSON.stringify(meta))
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/medias/upload`, {
        method: "post",
        credentials: "same-origin",
        body: fd
      })

      if (!response.ok) {
        this.dash.create(ErrorDialog).show("Something went wrong. Try to change avatar later.")
        this.log.error("Unable to change avatar", response.statusText)
        this.setPickerToAccountAvatar()
      } else {
        let result = await response.json()

        if (result.modelUpd)
          this.model.processModelUpdate(result.modelUpd)
        if (result.done)
          this.log.info("Avatar successfully updloaded.")
        else
          this.log.error("Error while uploading image.")
      }
    } catch (err) {
      this.dash.create(ErrorDialog).show("Unable to change avatar. Network error.")
      this.log.error("Unable to change avatar", err)
    }

    this.setPickerToAccountAvatar()
  }
}