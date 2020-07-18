import { Dash } from "bkb"
import handledom from "handledom"
import { MediaModel } from "../AppModel/Models/MediaModel"
import { MediaVariantModel } from "../AppModel/Models/MediaVariantModel"
import { closestImageVariant, getMainMediaType } from "../libraries/mediaUtils"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
@import "../shared-ui/theme/definitions";

.FileThumbnail {
  background-position: center;
  background-size: cover;
  border-radius: 50%;
  display: inline-block;
  font-size: 18px;
  text-align: center;
  &.text {
    background-color: #777;
    color: #fff;
    font-size: $f13;
  }
}
`

const template = handledom`
<span class="FileThumbnail"></span>
`

function makeVideoThumbnail(el: HTMLElement) {
  el.innerText = "🎞" // 📹
  el.classList.remove("text")
}

function makeAudioThumbnail(el: HTMLElement) {
  el.innerText = "🎵"
  el.classList.remove("text")
}

function makePdfThumbnail(el: HTMLElement) {
  el.innerText = "PDF"
  el.classList.add("text")
}

function makeDefaultThumbnail(el: HTMLElement) {
  el.innerText = "📂"
  el.classList.remove("text")
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
    const { root } = template()
    this.el = root
    this.el.style.width = `${options.width}px`
    this.el.style.height = `${options.height}px`

    this.chosenVariant = closestImageVariant(options.media, options.width, options.height) || options.media.variants[0]
    this.createThumbnail()
  }

  private createThumbnail() {
    const mtype = getMainMediaType(this.options.media)
    if (mtype === "image")
      this.displayImageThumbnail()
    else if (mtype === "video")
      makeVideoThumbnail(this.el)
    else if (mtype === "audio")
      makeAudioThumbnail(this.el)
    else if (this.chosenVariant.mediaType === "application/pdf")
      makePdfThumbnail(this.el)
    else
      makeDefaultThumbnail(this.el)
  }

  private displayImageThumbnail() {
    this.el.style.backgroundImage = `url('${this.chosenVariant.url}')`
  }
}
