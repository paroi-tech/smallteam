import { BackendContext } from "../backendContext/context"
import { fetchRelatedFilesInfo, MainMetaCode } from "../uploadEngine"
import { FileInfoFragment } from "../../isomorphic/meta/FileInfo"
import config from "../../isomorphic/config"

export async function getFileInfoFragments(metaCode: MainMetaCode, metaVal: string): Promise<FileInfoFragment[]> {
  let infos = await fetchRelatedFilesInfo(metaCode, metaVal)

  return infos.map(info => ({
    ...info,
    url: `${config.urlPrefix}/get-file/${info.id}`
  } as FileInfoFragment))
}

export async function getSingleFileInfoFragment(metaCode: MainMetaCode, metaVal: string): Promise<FileInfoFragment | undefined> {
  let infos = await getFileInfoFragments(metaCode, metaVal)

  return infos.length === 0 ? undefined : infos[0]
}
