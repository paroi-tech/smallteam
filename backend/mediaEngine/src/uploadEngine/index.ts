import { Router } from "express";
import { Media, Variant, MediaStorage } from "../mediaStorage";
import { declareRoutes } from "./declareRoutes"
import { UploadEngineContext } from "./internal-definitions";
import { UploadEngineManager } from "./exported-definitions";

export interface UploadEngineConfiguration {
  manager: UploadEngineManager
  urlPrefix?: string
  storage: MediaStorage
}

export interface UploadEngine {
  readonly storage: MediaStorage
  declareRoutes(router: Router, ignoreUrlPrefix?: boolean): void
  getFileUrl(media: Media, variant: Variant): string
}

export function createUploadEngine(conf: UploadEngineConfiguration): UploadEngine {
  let cx: UploadEngineContext = {
    manager: conf.manager,
    storage: conf.storage,
    urlPrefix: conf.urlPrefix || ""
  }
  return {
    get storage() {
      return conf.storage
    },
    declareRoutes: (router: Router, ignoreUrlPrefix = false) => declareRoutes(cx, router, ignoreUrlPrefix),
    getFileUrl: (media: Media, variant: Variant) => {
      let year = new Date(media.ts).getFullYear()
      return `${cx.urlPrefix}/medias/${year}/${variant.id}/${encodeURIComponent(variant.fileName)}`
    }
  }
}
