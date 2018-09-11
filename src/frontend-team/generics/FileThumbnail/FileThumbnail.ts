import { Dash } from "bkb"
import { render } from "@fabtom/lt-monkberry"
import { MediaModel } from "../../AppModel/Models/MediaModel"
import { getMediaType, closestImageVariant } from "../../libraries/mediaUtils"
import { MediaVariantModel } from "../../AppModel/Models/MediaVariantModel"

import template = require("./FileThumbnail.monk")

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

export interface FileThumbnailOptions {
  media: MediaModel
  width: number
  height: number
}

export default class FileThumbnail {
  readonly el: HTMLElement
  private chosenVariant: MediaVariantModel

  constructor(private dash: Dash, private options: FileThumbnailOptions) {
    let view = render(template)
    this.el = view.rootEl()
    this.el.style.width = `${options.width}px`
    this.el.style.height = `${options.height}px`

    this.chosenVariant = closestImageVariant(options.media, options.width, options.height) || options.media.variants[0]
    this.createThumbnail()
  }

  private createThumbnail() {
    let mtype = getMediaType(this.options.media)
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
