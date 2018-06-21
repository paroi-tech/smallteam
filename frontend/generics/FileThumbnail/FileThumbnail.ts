import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import { MediaModel } from "../../AppModel/Models/MediaModel"
import { getMediaType, closestImageVariant } from "../../libraries/mediaUtils"
import { MediaVariantModel } from "../../AppModel/Models/MediaVariantModel"

const template = require("./FileThumbnail.monk")

function makeVideoThumbnail(elt: HTMLElement) {
  elt.classList.add("fas", "fa-file-video")
}

function makeAudioThumbnail(elt: HTMLElement) {
  elt.classList.add("fas", "fa-file-audio")
}

function makePdfThumbnail(elt: HTMLElement) {
  elt.classList.add("fas", "fa-file-pdf")
}

function makeDefaultThumbnail(elt: HTMLElement) {
  elt.classList.add("fas", "fa-file-alt")
}

export default class FileThumbnail {
  readonly el: HTMLElement
  private chosenVariant: MediaVariantModel

  constructor(private dash: Dash, private media: MediaModel, readonly width: number, readonly height: number) {
    let view = render(template)
    this.el = view.rootEl()
    this.el.style.width = `${width}px`
    this.el.style.height = `${height}px`

    this.chosenVariant = closestImageVariant(this.media, this.width, this.height) || this.media.variants[0]
    this.createThumbnail()
  }

  private createThumbnail() {
    let mtype = getMediaType(this.media)
    if (mtype === "image")
      this.displayImageThumbnail()
    else if (mtype === "video")
      makeVideoThumbnail(this.el)
    else if (mtype === "audio")
      makeAudioThumbnail(this.el)
    else if (this.chosenVariant.imType === "application/pdf")
      makePdfThumbnail(this.el)
    else
      makeDefaultThumbnail(this.el)
  }

  private displayImageThumbnail() {
    this.el.style.backgroundImage = `url('${this.chosenVariant.url}')`
  }
}
