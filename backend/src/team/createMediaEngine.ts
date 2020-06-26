import { SBMainConnection } from "@ladc/sql-bricks-modifier"
import { createMediaStorage, ExternalRef, ImageVariantsConfiguration, isSupportedImage, Media, MediaStorage, MulterFile } from "@paroi/media-engine"
import { createUploadEngine, UploadEngine, UploadEngineManager } from "@paroi/media-engine/upload"
import { Request } from "express"
import { ModelUpdate, Type } from "../../../shared/Cargo"
import { appLog } from "../context"
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

export async function createMediaEngine(cn: SBMainConnection, execDdl: boolean): Promise<MediaEngine> {
  const storage = await createMediaStorage({
    execInitScript: execDdl ? "sqlite" : undefined,
    cn,
    imagesConf: IMAGES_CONF,
    logWarning: message => appLog.warn(`[MediaStorage] ${message}`)
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
      mediaType: "image/png"
    },
    {
      code: "200x200",
      width: 200,
      height: 200,
      mediaType: "image/jpeg"
    }
  ],
  "task": [
    {
      code: "200x100",
      width: 200,
      height: 100,
      embed: true,
      mediaType: "image/jpeg"
    }
  ]
}

function createUploadEngineManager(storage: MediaStorage): UploadEngineManager {
  return {
    async canUpload(req: Request, externalRef: ExternalRef, overwrite: boolean, file: MulterFile) {
      const sessionData = await getSessionData(req)
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
      const media = await storage.findMedia({ mediaId })
      let modelUpd: ModelUpdate | undefined
      if (media) {
        const subdomain = await getConfirmedSubdomain(req)
        if (!subdomain)
          throw new Error("Cannot use a media engine outside a subdomain")
        const mediaEngine = await getMediaEngine(subdomain)
        const loader = new CargoLoader()
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

    async canRead(req: Request) {
      return await hasSession(req)
    },

    async canDelete(req: Request) {
      return await hasSession(req)
    },

    async makeJsonResponseForDelete(req: Request, deletedMedia: Media) {
      const loader = new CargoLoader()
      // for (let variantCode of Object.keys(deletedMedia.variants))
      //   loader.modelUpdate.markFragmentAs("MediaVariant", deletedMedia.variants[variantCode].id, "deleted")
      loader.modelUpdate.markFragmentAs("Media", deletedMedia.id, "deleted")
      await markExternalTypeAsUpdate(req, deletedMedia, loader)
      const modelUpd = loader.modelUpdate.toModelUpdate()
      return {
        done: true,
        modelUpd
      }
    }
  }
}

async function markExternalTypeAsUpdate(req: Request, media: Media, loader: CargoLoader) {
  if (media.externalRef) {
    const subdomain = await getConfirmedSubdomain(req)
    const sessionData = await getSessionData(req)
    if (!subdomain || !sessionData || sessionData.subdomain !== subdomain)
      throw new Error("Cannot use a media engine outside a subdomain or without a session")
    const context: ModelContext = {
      subdomain,
      cn: await getCn(subdomain),
      mediaEngine: await getMediaEngine(subdomain),
      sessionData,
      loader
    }
    const updatedType = mediaExternalTypeToType(media.externalRef.type)
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
