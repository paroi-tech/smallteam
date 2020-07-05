import { MediaModel } from "../AppModel/Models/MediaModel"
import { MediaVariantModel } from "../AppModel/Models/MediaVariantModel"

export function closestImageVariant(avatar: MediaModel, width: number, height: number) {
  let choice: MediaVariantModel | undefined
  let minDistance = 10 ** 9
  for (const variant of avatar.variants.filter(v => v.imgWidth && v.imgHeight)) {
    const d = Math.abs(width - variant.imgWidth!) ** 2 + Math.abs(height - variant.imgHeight!) ** 2
    if (d < minDistance) {
      choice = variant
      minDistance = d
    }
  }

  return choice
}

export function getMainMediaType(media: MediaModel) {
  const mediaType = media.variants[0].mediaType
  const j = mediaType.indexOf("/")

  return mediaType.substr(0, j)
}

export function getMediaSubtype(variant: MediaVariantModel) {
  // See https://en.wikipedia.org/wiki/Media_type for details about IM types format.
  const s = variant.mediaType.substr(variant.mediaType.indexOf("/") + 1)
  const j = s.lastIndexOf(".")
  const re = /\+|;/
  const parts = s.substr(j + 1).split(re)

  return parts[0]
}
