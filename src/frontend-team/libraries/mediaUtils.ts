import { MediaVariantModel } from "../AppModel/Models/MediaVariantModel"
import { MediaModel } from "../AppModel/Models/MediaModel"

export function closestImageVariant(avatar: MediaModel, width: number, height: number) {
  let choice: MediaVariantModel | undefined = undefined
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

export function getMediaType(media: MediaModel) {
  let imType = media.variants[0].imType
  let j = imType.indexOf("/")

  return imType.substr(0, j)
}

export function getMediaSubtype(variant: MediaVariantModel) {
  // See https://en.wikipedia.org/wiki/Media_type for details about IM types format.
  let s = variant.imType.substr(variant.imType.indexOf("/") + 1)
  let j = s.lastIndexOf(".")
  let re = /\+|;/
  let parts = s.substr(j + 1).split(re)

  return parts[0]
}
