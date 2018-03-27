import { DatabaseConnectionWithSqlBricks } from "../../../utils/mycn-with-sqlbricks"
import { StoreMediaParameters, NewMedia, MediaOrVariantId, MediaFilter, VariantData, MediaQuery, Media, MediaRef, ImageVariantsConfiguration } from "./exported-definitions"
import { storeMedia } from "./storeMedia"
import { removeMedia, removeMedias } from "./removeMedias"
import { getFileData } from "./getFileData"
import { findMedias, findMedia } from "./findMedias"
import { findMediaRef } from "./findMediaRef"
import { MediaStorageContext } from "./internal-definitions";

export interface MediaStorageOptions {
  cn: DatabaseConnectionWithSqlBricks
  imagesConf?: ImageVariantsConfiguration
}

export interface MediaStorage {
  storeMedia(params: StoreMediaParameters): Promise<NewMedia>
  removeMedia(id: MediaOrVariantId): Promise<boolean>
  /**
   * @returns The deleted media identifiers (async)
   */
  removeMedias(filter: MediaFilter): Promise<string[]>
  getFileData(variantId: string): Promise<VariantData | undefined>
  findMedias(query: MediaQuery): Promise<Media[]>
  findMedia(query: MediaQuery): Promise<Media | undefined>
  findMediaRef(id: MediaOrVariantId): Promise<MediaRef | undefined>
}

export function createMediaStorage(options: MediaStorageOptions): MediaStorage {
  let cx: MediaStorageContext = {
    cn: options.cn,
    imagesConf: options.imagesConf || {}
  }
  return {
    storeMedia: (params: StoreMediaParameters) => storeMedia(cx, params),
    removeMedia: (id: MediaOrVariantId) => removeMedia(cx, id),
    removeMedias: (filter: MediaFilter) => removeMedias(cx, filter),
    getFileData: (variantId: string) => getFileData(cx, variantId),
    findMedias: (query: MediaQuery) => findMedias(cx, query),
    findMedia: (query: MediaQuery) => findMedia(cx, query),
    findMediaRef: (id: MediaOrVariantId) => findMediaRef(cx, id)
  }
}

export * from "./exported-definitions"