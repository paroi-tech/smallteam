import { BackendContext } from "../backendContext/context"
import { fetchListOfFileInfo } from "../uploadEngine"
import { FileInfoFragment } from "../../isomorphic/meta/FileInfo"
import config from "../../isomorphic/config"

export type MainMetaCode = "contributorAvatar" | "task"

export async function getFileInfoFragments(type: MainMetaCode, id: string): Promise<FileInfoFragment[]> {
  return await fetchListOfFileInfo({
    externalRef: { type, id },
    variantName: null
  })
}

export async function getSingleFileInfoFragment(type: MainMetaCode, id: string): Promise<FileInfoFragment | undefined> {
  let infos = await getFileInfoFragments(type, id)
  return infos.length === 0 ? undefined : infos[0]
}
