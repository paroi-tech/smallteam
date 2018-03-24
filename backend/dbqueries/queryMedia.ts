import { BackendContext } from "../backendContext/context"
import { findMedias, Variant, Media, findMedia } from "../uploadEngine/mediaStorage"
import { MediaVariantFragment } from "../../isomorphic/meta/MediaVariant"
import { MediaFragment } from "../../isomorphic/meta/Media";
import config from "../../isomorphic/config";
import { getFileUrl } from "../uploadEngine/uploadEngine";

export type MainMetaCode = "contributorAvatar" | "task"

export async function fetchMedias(context: BackendContext, type: MainMetaCode, id: string): Promise<string[]> {
  let medias = await findMedias({
    externalRef: { type, id }
  })
  let { mediaFragments, variantFragments } = toMediaAndVariantFragments(medias)

  for (let frag of mediaFragments)
    context.loader.addFragment({ type: "Media", frag })
  for (let frag of variantFragments)
    context.loader.addFragment({ type: "MediaVariant", frag })

  return mediaFragments.map(frag => frag.id)
}

export async function fetchSingleMedia(context: BackendContext, type: MainMetaCode, id: string): Promise<string | undefined> {
  let media = await findMedia({
    externalRef: { type, id }
  })
  if (!media)
    return

  let { mediaFragments, variantFragments } = toMediaAndVariantFragments([media])

  for (let frag of mediaFragments)
    context.loader.addFragment({ type: "Media", frag })
  for (let frag of variantFragments)
    context.loader.addFragment({ type: "MediaVariant", frag })

  return media.id
}

interface MediaAndVariantFragments {
  mediaFragments: MediaFragment[]
  variantFragments: MediaVariantFragment[]
}

function toMediaAndVariantFragments(medias: Media[]): MediaAndVariantFragments {
  let mediaFragments: MediaFragment[] = []
  let variantFragments: MediaVariantFragment[] = []
  for (let media of medias) {
    mediaFragments.push(toMediaFragment(media))
    for (let variantCode of Object.keys(media.variants))
      variantFragments.push(toMediaVariantFragment(media.variants[variantCode], media))
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
    ownerId: media.ownerId
  }
}

function toMediaVariantFragment(variant: Variant, media: Media): MediaVariantFragment {
  return {
    id: variant.id,
    mediaId: media.id,
    code: variant.code,
    weightB: variant.weightB,
    imType: variant.imType,
    url: getFileUrl(media, variant, config.urlPrefix),
    imgWidth: variant.img ? variant.img.width : undefined,
    imgHeight: variant.img ? variant.img.height : undefined,
    imgDpi: variant.img ? variant.img.dpi : undefined
  }
}
