import { BackendContext } from "./backendContext/context"
import { Variant, Media, ExternalRef } from "@fabtom/media-engine"
import { MediaVariantFragment } from "../../isomorphic/meta/MediaVariant"
import { MediaFragment } from "../../isomorphic/meta/Media"
import { ChangedType } from "./backendContext/ModelUpdateLoader"
import CargoLoader from "./backendContext/CargoLoader"
import { MediaEngine } from "../createMediaEngine";

export type MainMetaCode = "contributorAvatar" | "task"

export async function fetchMedias(context: BackendContext, type: MainMetaCode, id: string): Promise<string[]> {
  let medias = await context.mediaEngine.storage.findMedias({
    externalRef: { type, id }
  })
  return putMediasToCargoLoader(context.mediaEngine, context.loader, medias)
}

export async function fetchSingleMedia(context: BackendContext, type: MainMetaCode, id: string): Promise<string | undefined> {
  let media = await context.mediaEngine.storage.findMedia({
    externalRef: { type, id }
  })
  if (media) {
    putMediasToCargoLoader(context.mediaEngine, context.loader, [media])
    return media.id
  }
}

export function putMediasToCargoLoader(mediaEngine: MediaEngine, loader: CargoLoader, medias: Media[], markAs?: ChangedType): string[] {
  let { mediaFragments, variantFragments } = toMediaAndVariantFragments(mediaEngine, medias)

  for (let frag of mediaFragments) {
    loader.addFragment({ type: "Media", frag })
    if (markAs)
      loader.modelUpdate.markFragmentAs("Media", frag.id, markAs)
  }
  for (let frag of variantFragments)
    loader.addFragment({ type: "MediaVariant", frag })

  return mediaFragments.map(frag => frag.id)
}

export async function deleteMedias(context: BackendContext, externalRef: ExternalRef) {
  let idList = await context.mediaEngine.storage.removeMedias({ externalRef })
  for (let mediaId of idList)
    context.loader.modelUpdate.markFragmentAs("Media", mediaId, "deleted")
}

interface MediaAndVariantFragments {
  mediaFragments: MediaFragment[]
  variantFragments: MediaVariantFragment[]
}

function toMediaAndVariantFragments(mediaEngine: MediaEngine, medias: Media[]): MediaAndVariantFragments {
  let mediaFragments: MediaFragment[] = []
  let variantFragments: MediaVariantFragment[] = []
  for (let media of medias) {
    mediaFragments.push(toMediaFragment(media))
    for (let variantCode of Object.keys(media.variants))
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
    imType: variant.imType,
    url: mediaEngine.uploadEngine.getFileUrl(media, variant),
    imgWidth: variant.img ? variant.img.width : undefined,
    imgHeight: variant.img ? variant.img.height : undefined,
    imgDpi: variant.img ? variant.img.dpi : undefined
  }
}
