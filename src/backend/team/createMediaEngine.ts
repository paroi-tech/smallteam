import { createMediaStorage, ExternalRef, ImageVariantsConfiguration, isSupportedImage, Media, MediaRef, MediaStorage, MulterFile } from "@fabtom/media-engine"
import { createUploadEngine, UploadEngine, UploadEngineManager } from "@fabtom/media-engine/upload"
import { Request } from "express"
import { DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"
import { ModelUpdate, Type } from "../../shared/Cargo"
import { getSessionData, hasSession } from "../session"
import { getCn, getMediaEngine } from "../utils/dbUtils"
import { getConfirmedSubdomain, getSubdirUrl } from "../utils/serverUtils"
import { completeCargo } from "./appModelBackend"
import { CargoLoader, ModelContext } from "./appModelBackend/backendContext/context"
import { putMediasToCargoLoader } from "./appModelBackend/queryMedia"

export const MEDIAS_BASE_URL = "/medias"

export interface MediaEngine {
  storage: MediaStorage
  uploadEngine: UploadEngine
}

export async function createMediaEngine(cn: DatabaseConnectionWithSqlBricks, execDdl: boolean): Promise<MediaEngine> {
  let storage = await createMediaStorage({
    execInitScript: execDdl ? "sqlite" : undefined,
    cn,
    imagesConf: IMAGES_CONF
  })
  return {
    storage,
    uploadEngine: createUploadEngine({
      manager: createUploadEngineManager(storage),
      storage,
      baseUrl: `${getSubdirUrl()}${MEDIAS_BASE_URL}`
    })
  }
}

const IMAGES_CONF: ImageVariantsConfiguration = {
  "accountAvatar": [
    {
      code: "34x34",
      width: 68,
      height: 68,
      imType: "image/png"
    },
    {
      code: "200x200",
      width: 200,
      height: 200,
      imType: "image/jpeg"
    }
  ],
  "task": [
    {
      code: "200x100",
      width: 200,
      height: 100,
      embed: true,
      imType: "image/jpeg"
    }
  ]
}

function createUploadEngineManager(storage: MediaStorage): UploadEngineManager {
  return {
    async canUpload(req: Request, externalRef: ExternalRef, overwrite: boolean, file: MulterFile) {
      let sessionData = await getSessionData(req)
      if (!sessionData) {
        return {
          canUpload: false,
          errorCode: 403 // Forbidden
        }
      }
      if (!["accountAvatar", "task"].includes(externalRef.type)) {
        return {
          canUpload: false,
          errorCode: 400, // Bad Request
          errorMsg: `Invalid externalRef.type: ${externalRef.type}`
        }
      }
      if (externalRef.type === "accountAvatar" && !isSupportedImage(file.mimetype)) {
        return {
          canUpload: false,
          errorCode: 400, // Bad Request
          errorMsg: "Only PNG, JPEG, GIF and WebP files are allowed."
        }
      }
      // TODO: Check the existence of `externalRef.id` in the database
      return {
        canUpload: true,
        ownerId: sessionData.accountId
      }
    },

    async makeJsonResponseForUpload(req: Request, mediaId: string, overwritten: boolean) {
      let media = await storage.findMedia({ mediaId })
      let modelUpd: ModelUpdate | undefined
      if (media) {
        let subdomain = await getConfirmedSubdomain(req)
        if (!subdomain)
          throw new Error(`Cannot use a media engine outside a subdomain`)
        let mediaEngine = await getMediaEngine(subdomain)
        let loader = new CargoLoader()
        loader.startResponse("none")
        putMediasToCargoLoader(mediaEngine, loader, [media], overwritten ? "updated" : "created")
        await markExternalTypeAsUpdate(req, media, loader)
        modelUpd = loader.modelUpdate.toModelUpdate()
      }
      return {
        done: true,
        modelUpd
      }
    },

    async canRead(req: Request, mediaRef: MediaRef) {
      return await hasSession(req)
    },

    async canDelete(req: Request, mediaRef: MediaRef) {
      return await hasSession(req)
    },

    async makeJsonResponseForDelete(req: Request, deletedMedia: Media) {
      let loader = new CargoLoader()
      // for (let variantCode of Object.keys(deletedMedia.variants))
      //   loader.modelUpdate.markFragmentAs("MediaVariant", deletedMedia.variants[variantCode].id, "deleted")
      loader.modelUpdate.markFragmentAs("Media", deletedMedia.id, "deleted")
      await markExternalTypeAsUpdate(req, deletedMedia, loader)
      let modelUpd = loader.modelUpdate.toModelUpdate()
      return {
        done: true,
        modelUpd
      }
    }
  }
}

async function markExternalTypeAsUpdate(req: Request, media: Media, loader: CargoLoader) {
  if (media.externalRef) {
    let subdomain = await getConfirmedSubdomain(req)
    let sessionData = await getSessionData(req)
    if (!subdomain || !sessionData || sessionData.subdomain !== subdomain)
      throw new Error(`Cannot use a media engine outside a subdomain or without a session`)
    let context: ModelContext = {
      subdomain,
      cn: await getCn(subdomain),
      mediaEngine: await getMediaEngine(subdomain),
      sessionData,
      loader
    }
    let updatedType = mediaExternalTypeToType(media.externalRef.type)
    context.loader.modelUpdate.addFragment(updatedType, media.externalRef.id)
    context.loader.modelUpdate.markFragmentAs(updatedType, media.externalRef.id, "updated")
    await completeCargo(context)
  }
}

function mediaExternalTypeToType(externalRefType: string): Type {
  switch (externalRefType) {
    case "accountAvatar":
      return "Account"
    case "task":
      return "Task"
    default:
      throw new Error(`Unknown media.externalRef.type: ${externalRefType}`)
  }
}
