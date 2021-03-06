import { removeAllChildren } from "@smallteam-local/shared-ui/libraries/utils"
import ErrorDialog from "@smallteam-local/shared-ui/modal-dialogs/ErrorDialog"
import { Log } from "bkb"
import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { Model, TaskModel } from "../../AppModel/AppModel"
import { MediaModel } from "../../AppModel/Models/MediaModel"
import FileThumbnail from "../../generics/FileThumbnail"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.TaskAttachmentManager {
  &-header {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }

  &-uploadButton {
    display: block;
  }

  li {
    align-items: center;
    display: flex;
    vertical-align: baseline;
  }
}
`

const template = handledom`
<div class="TaskAttachmentManager">
  <header class="TaskAttachmentManager-header">
    <div class="TaskAttachmentManager-headerLeft">Attached files</div>
    <div class="TaskAttachmentManager-headerRight"></div>
  </header>

  <ul class="TaskAttachementManager-ul" h="ul"></ul>

  <form action="" method="post" enctype="multipart/form-data" h="form">
    <input name="f" type="file" h="input">
    <button class="TaskAttachmentManager-uploadButton WithLoader -right" type="submit" h="upload">
      Send file
      <span class="WithLoader-l" hidden h="spinner"></span>
    </button>
  </form>
</div>
`

const mediaTemplate = handledom`
<li>
  <span h="thumbnail"></span>
  <button title="Click to download" h="download">{{ name }}</button> &nbsp;
  <button style="color: red" title="Click to delete file" h="remove">×</button>
</li>
`

export default class TaskAttachmentManager {
  readonly el: HTMLElement
  private listEl: HTMLElement
  private formEl: HTMLFormElement
  private inputEl: HTMLInputElement
  private spinnerEl: HTMLElement

  private model: Model
  private currentTask?: TaskModel
  private log: Log

  constructor(private dash: OwnDash) {
    this.model = this.dash.app.model
    this.log = this.dash.app.log

    const { root, ref } = template()

    this.el = root
    this.listEl = ref("ul")
    this.formEl = ref("form")
    this.inputEl = ref("input")
    this.spinnerEl = ref("spinner")
    this.formEl.onsubmit = (ev) => {
      ev.preventDefault()
      this.onFormSubmit().catch(err => this.dash.log.error(err))
    }

    this.dash.listenToModel("updateTask", task => {
      if (this.currentTask && this.currentTask.id === task.id)
        this.refreshMediaList()
    })
  }

  get task() {
    return this.currentTask
  }

  setTask(task?: TaskModel) {
    this.currentTask = task
    this.inputEl.value = ""
    this.refreshMediaList()
  }

  private refreshMediaList() {
    removeAllChildren(this.listEl)
    this.listAttachedMedias()
  }

  private listAttachedMedias() {
    if (!this.currentTask || !this.currentTask.attachedMedias)
      return
    for (const media of this.currentTask.attachedMedias)
      this.displayMedia(media)
  }

  private displayMedia(media: MediaModel) {
    const { root: el, ref, update } = mediaTemplate()
    const thumbnail = this.dash.create(FileThumbnail, {
      media,
      width: 24,
      height: 24
    })

    ref("thumbnail").appendChild(thumbnail.el)
    ref("download").addEventListener("click", () => {
      const orig = media.getVariant("orig")
      if (orig)
        window.open(`${orig.url}?download=1`)
    })
    ref("remove").addEventListener("click", () => {
      const accountId = this.model.session.account.id
      if (media.ownerId === accountId && this.removeTaskAttachment(media.id))
        this.listEl.removeChild(el)
    })
    update({ name: media.originalName || media.baseName })
    this.listEl.appendChild(el)
  }

  private async onFormSubmit() {
    if (!this.inputEl.files || this.inputEl.files.length === 0)
      return
    this.showSpinner()
    await this.doUpload()
    this.hideSpinner()
  }

  private async doUpload() {
    if (!this.currentTask)
      return

    const meta = {
      ref: {
        type: "task",
        id: this.currentTask.id
      }
    }
    const fd = new FormData(this.formEl)

    fd.append("meta", JSON.stringify(meta))
    try {
      const response = await fetch(`${this.dash.app.baseUrl}/medias/upload`, {
        method: "post",
        credentials: "same-origin",
        body: fd
      })

      if (!response.ok) {
        await this.dash.create(ErrorDialog).show("Request was not processed by server.")
        return
      }

      const result = await response.json()

      if (result.modelUpd)
        this.model.processModelUpdate(result.modelUpd)

      if (result.done)
        this.inputEl.value = ""
      else
        this.log.error("Error while uploading image.")
    } catch (err) {
      this.log.warn(err)
    }
  }

  private async removeTaskAttachment(mediaId: string) {
    if (!this.currentTask)
      return false

    let result = false

    try {
      const response = await fetch(`${this.dash.app.baseUrl}/medias/delete`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ mediaId })
      })

      if (!response.ok) {
        this.log.error("Unable to get a response from server...")
        return false
      }

      const data = await response.json()

      if (data.modelUpd)
        this.model.processModelUpdate(data.modelUpd)

      if (data.done)
        result = true
      else
        this.log.warn("Attachment not deleted")
    } catch (err) {
      this.log.warn(err)
    }

    return result
  }

  private showSpinner() {
    this.spinnerEl.hidden = false
  }

  private hideSpinner() {
    this.spinnerEl.hidden = true
  }
}
