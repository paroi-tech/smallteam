import { MediaModel } from "../AppModel/Models/MediaModel"
import { MediaVariantModel } from "../AppModel/Models/MediaVariantModel"

export function closestImageVariant(avatar: MediaModel, width: number, height: number) {
  let choice: MediaVariantModel | undefined
  let minDistance = 10 ** 9
  for (let variant of avatar.variants.filter(v => v.imgWidth && v.imgHeight)) {
    let d = Math.abs(width - variant.imgWidth!) ** 2 + Math.abs(height - variant.imgHeight!) ** 2
    if (d < minDistance) {
      choice = variant
      minDistance = d
    }
  }

  return choice
}

export function getMainMediaType(media: MediaModel) {
  let mediaType = media.variants[0].mediaType
  let j = mediaType.indexOf("/")

  return mediaType.substr(0, j)
}

export function getMediaSubtype(variant: MediaVariantModel) {
  // See https://en.wikipedia.org/wiki/Media_type for details about IM types format.
  let s = variant.mediaType.substr(variant.mediaType.indexOf("/") + 1)
  let j = s.lastIndexOf(".")
  let re = /\+|;/
  let parts = s.substr(j + 1).split(re)

  return parts[0]
}
