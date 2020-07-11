import { ExternalRef, Media, Variant } from "@paroi/media-engine"
import { MediaFragment } from "@smallteam-local/shared/dist/meta/Media"
import { MediaVariantFragment } from "@smallteam-local/shared/dist/meta/MediaVariant"
import { MediaEngine } from "../createMediaEngine"
import CargoLoader from "./backendContext/CargoLoader"
import { ModelContext } from "./backendContext/context"
import { ChangedType } from "./backendContext/ModelUpdateLoader"

export type MainMetaCode = "accountAvatar" | "task"

export async function fetchMedias(context: ModelContext, type: MainMetaCode, id: string): Promise<string[]> {
  const medias = await context.mediaEngine.storage.findMedias({
    externalRef: { type, id }
  })
  return putMediasToCargoLoader(context.mediaEngine, context.loader, medias)
}

export async function fetchSingleMedia(context: ModelContext, type: MainMetaCode, id: string): Promise<string | undefined> {
  const media = await context.mediaEngine.storage.findMedia({
    externalRef: { type, id }
  })
  if (media) {
    putMediasToCargoLoader(context.mediaEngine, context.loader, [media])
    return media.id
  }
}

export function putMediasToCargoLoader(mediaEngine: MediaEngine, loader: CargoLoader, medias: Media[], markAs?: ChangedType): string[] {
  const { mediaFragments, variantFragments } = toMediaAndVariantFragments(mediaEngine, medias)

  for (const frag of mediaFragments) {
    loader.addFragment({ type: "Media", frag })
    if (markAs)
      loader.modelUpdate.markFragmentAs("Media", frag.id, markAs)
  }
  for (const frag of variantFragments)
    loader.addFragment({ type: "MediaVariant", frag })

  return mediaFragments.map(frag => frag.id)
}

export async function deleteMedias(context: ModelContext, externalRef: ExternalRef) {
  const idList = await context.mediaEngine.storage.removeMedias({ externalRef })
  for (const mediaId of idList)
    context.loader.modelUpdate.markFragmentAs("Media", mediaId, "deleted")
}

interface MediaAndVariantFragments {
  mediaFragments: MediaFragment[]
  variantFragments: MediaVariantFragment[]
}

function toMediaAndVariantFragments(mediaEngine: MediaEngine, medias: Media[]): MediaAndVariantFragments {
  const mediaFragments: MediaFragment[] = []
  const variantFragments: MediaVariantFragment[] = []
  for (const media of medias) {
    mediaFragments.push(toMediaFragment(media))
    for (const variantCode of Object.keys(media.variants))
      variantFragments.push(toMediaVariantFragment(mediaEngine, media.variants[variantCode], media))
  }
  return {
    mediaFragments,
    variantFragments
  }
}

function toMediaFragment(media: Media): MediaFragment {
  return {
    id: media.id,
    ts: media.ts,
    baseName: media.baseName,
    originalName: media.originalName,
    ownerId: media.ownerId,
    externalType: media.externalRef ? media.externalRef.type : undefined,
    externalId: media.externalRef ? media.externalRef.id : undefined
  }
}

function toMediaVariantFragment(mediaEngine: MediaEngine, variant: Variant, media: Media): MediaVariantFragment {
  return {
    id: variant.id,
    mediaId: media.id,
    code: variant.code,
    weightB: variant.weightB,
    mediaType: variant.mediaType,
    url: mediaEngine.uploadEngine.getFileUrl(media, variant),
    imgWidth: variant.img ? variant.img.width : undefined,
    imgHeight: variant.img ? variant.img.height : undefined,
    imgDpi: variant.img ? variant.img.dpi : undefined
  }
}
