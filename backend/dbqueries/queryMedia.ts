import { BackendContext } from "../backendContext/context"
import { fetchVariants, Variant } from "../uploadEngine"
import { MediaVariantFragment } from "../../isomorphic/meta/MediaVariant"
import { MediaFragment } from "../../isomorphic/meta/Media";

export type MainMetaCode = "contributorAvatar" | "task"

export async function getMediaVariantInfoFragments(type: MainMetaCode, id: string): Promise<MediaVariantFragment[]> {
  let infos = await fetchVariants({
    externalRef: { type, id },
    variantName: null
  })
}

interface MediaAndVariantFragments {
  mediaFragments: MediaFragment[]
  variantFragments: MediaVariantFragment[]
}

function toMediaVariantInfoFragments(infos: Variant[]): MediaAndVariantFragments {
  let variantFragments: MediaVariantFragment[] = []
  let mediaFragments = new Map<string, MediaFragment>()
  for (let info of infos) {
    variantFragments.push({
      id: info.id,
      weightB: info.weightB,
      imType: info.imType,
      variantName: info.variantName,
      url: info.url,
      imgWidth: info.img ? info.img.width : undefined,
      imgHeight: info.img ? info.img.height : undefined,
      imgDpi: info.img ? info.img.dpi : undefined
    })
    mediaFragments.set(info.media.id, info.media)
  }
  return {
    mediaFragments: Array.from(mediaFragments.values()),
    variantFragments
  }
}

export async function getSingleMediaVariantFragment(type: MainMetaCode, id: string): Promise<MediaVariantFragment | undefined> {
  let infos = await getMediaVariantInfoFragments(type, id)
  return infos.length === 0 ? undefined : infos[0]
}

async function addAvatar(context: BackendContext, frag: ContributorFragment) {
  let info = await getSingleMediaVariantFragment("contributorAvatar", frag.id)
  if (!info)
    return
  frag.avatarId = info.id
  context.loader.addFragment({
    type: "FileInfo",
    frag: info,
  })
}
