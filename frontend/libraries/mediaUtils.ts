import { MediaVariantModel } from "../AppModel/Models/MediaVariantModel"
import { MediaModel } from "../AppModel/Models/MediaModel"

export function findClosestVariant(avatar: MediaModel, width: number, height: number) {
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
  let parts = imType.split("/")
  return parts[0].toUpperCase()
}

export function getMediaSubtype(variant: MediaVariantModel) {
  // See https://en.wikipedia.org/wiki/Media_type for details about IM types format.
  // The following regex matches a slash, a dot or a semi-colon.
  let re = /\/|\.|;/
  let parts = variant.imType.split(re)
  if (parts.length < 2)
    return parts[0]
  else if (parts[1] === "vnd" || parts[1] === "prs" || parts[1] === "x")
    return parts[2]
  else
    return parts[1]
}
