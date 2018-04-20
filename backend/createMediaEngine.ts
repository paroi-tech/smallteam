import { Request } from "express"
import { SessionData, BackendContext, CargoLoader } from "./backendContext/context"
import { getSessionData, hasSessionData } from "./session"
import { MediaFragment } from "../isomorphic/meta/Media"
import { putMediasToCargoLoader } from "./dbqueries/queryMedia"
import { ModelUpdate, Type } from "../isomorphic/Cargo"
import { completeCargo } from "./modelStorage"
import config from "../isomorphic/config";
import { ExternalRef, MediaRef, Media, MulterFile, MediaStorage, createMediaStorage, ImageVariantsConfiguration, isSupportedImage } from "@fabtom/media-engine"
import { createUploadEngine, UploadEngine, UploadEngineManager } from "@fabtom/media-engine/upload"
import { DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"

export interface MediaEngine {
  storage: MediaStorage
  uploadEngine: UploadEngine
}

export async function createMediaEngine(cn: DatabaseConnectionWithSqlBricks, execDdl: boolean): Promise<MediaEngine> {
  let storage = await createMediaStorage({
    initDb: {
      dbEngine: "sqlite",
      execDdl
    },
    cn,
    imagesConf: IMAGES_CONF
  })
  return {
    storage,
    uploadEngine: createUploadEngine({
      manager: createUploadEngineManager(storage),
      storage,
      urlPrefix: config.urlPrefix
    })
  }
}

const IMAGES_CONF: ImageVariantsConfiguration = {
  "contributorAvatar": [
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
    canUpload(req: Request, externalRef: ExternalRef, overwrite: boolean, file: MulterFile) {
      if (!hasSessionData(req)) {
        return {
          canUpload: false,
          errorCode: 403 // Forbidden
        }
      }
      let sessionData = getSessionData(req)
      if (!["contributorAvatar", "task"].includes(externalRef.type)) {
        return {
          canUpload: false,
          errorCode: 400, // Bad Request
          errorMsg: `Invalid externalRef.type: ${externalRef.type}`
        }
      }
      if (externalRef.type === "contributorAvatar" && !isSupportedImage(file.mimetype)) {
        return {
          canUpload: false,
          errorCode: 400, // Bad Request
          errorMsg: "Only PNG, JPEG, GIF and WebP files are allowed."
        }
      }
      // TODO: Check the existence of `externalRef.id` in the database
      return {
        canUpload: true,
        ownerId: sessionData.contributorId
      }
    },

    async makeJsonResponseForUpload(req: Request, mediaId: string, overwritten: boolean) {
      let media = await storage.findMedia({ mediaId })
      let modelUpd: ModelUpdate | undefined
      if (media) {
        let loader = new CargoLoader()
        loader.startResponse("none")
        putMediasToCargoLoader(loader, [media], overwritten ? "updated" : "created")
        await markExternalTypeAsUpdate(req, media, loader)
        modelUpd = loader.modelUpdate.toModelUpdate()
      }
      return {
        done: true,
        modelUpd
      }
    },

    canRead(req: Request, mediaRef: MediaRef) {
      return hasSessionData(req)
    },

    canDelete(req: Request, mediaRef: MediaRef) {
      return hasSessionData(req)
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
    let context: BackendContext = {
      sessionData: getSessionData(req),
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
    case "contributorAvatar":
      return "Contributor"
    case "task":
      return "Task"
    default:
      throw new Error(`Unknown media.externalRef.type: ${externalRefType}`)
  }
}