require("./_AvatarForm.scss")
import { Log } from "bkb"
import handledom from "handledom"
import { ErrorDialog } from "../../../../../shared-ui/modalDialogs/modalDialogs"
import { OwnDash } from "../../../App/OwnDash"
import { AccountModel, Model } from "../../../AppModel/AppModel"

const template = handledom`
<div class="AvatarForm">
  <h1 class="TitleBar">Change your profile picture (PNG, JPEG or GIF)</h1>
  <form action="" method="post" enctype="multipart/form-data" h="form">
    <input name="f" type="file" class="AvatarForm-input" accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml" h="input">
    <button class="Btn WithLoader -right" type="Submit" h="btn">
      Submit
      <span class="WithLoader-l" hidden h="spinner"></span>
    </button>
  </form>
</div>
`

export default class AvatarForm {
  readonly el: HTMLElement
  private inputEl: HTMLInputElement
  private spinnerEl: HTMLElement
  private formEl: HTMLFormElement

  private model: Model
  private log: Log

  constructor(private dash: OwnDash, readonly account: AccountModel) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    const { root, ref } = template()

    this.el = root
    this.formEl = ref("form")
    this.inputEl = ref("input")
    this.spinnerEl = ref("spinner")
    this.formEl.addEventListener("submit", ev => {
      ev.preventDefault()
      this.onSubmit()
    })
  }

  private async onSubmit() {
    if (!this.inputEl.files || this.inputEl.files.length === 0) {
      this.log.warn("No image provided...")
      return
    }

    this.showSpinner()
    await this.doUpload()
    this.hideSpinner()
  }

  private async doUpload() {
    let meta = {
      ref: {
        type: "accountAvatar",
        id: this.account.id
      },
      overwrite: true
    }

    let fd = new FormData(this.formEl)
    fd.append("meta", JSON.stringify(meta))
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/medias/upload`, {
        method: "post",
        credentials: "same-origin",
        body: fd
      })

      if (!response.ok) {
        await this.dash.create(ErrorDialog).show("Request was not processed by server.")
        return
      }

      let result = await response.json()
      if (result.modelUpd)
        this.model.processModelUpdate(result.modelUpd)
      if (result.done)
        this.log.info("Avatar successfully updloaded.")
      else
        this.log.error("Error while uploading image.")
    } catch (err) {
      this.dash.app.log.warn(err)
    }
  }

  private showSpinner() {
    this.spinnerEl.hidden = false
  }

  private hideSpinner() {
    this.spinnerEl.hidden = true
  }
}
