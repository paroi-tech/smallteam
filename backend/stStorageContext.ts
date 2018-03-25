import { Request } from "express"
import { StorageContext, CanUpload } from "./uploadEngine/uploadEngine"
import { ExternalRef, MediaRef, Media, MulterFile, findMedia } from "./uploadEngine/mediaStorage"
import { SessionData, BackendContext, CargoLoader } from "./backendContext/context"
import { checkSession } from "./session"
import { MediaFragment } from "../isomorphic/meta/Media";
import { putMediasToCargoLoader } from "./dbqueries/queryMedia";
import { ModelUpdate } from "../isomorphic/Cargo";

export const stStorageContext: StorageContext = {
  canUpload(req: Request, externalRef: ExternalRef, overwrite: boolean, file: MulterFile) {
    let connected = checkSession(req)
    if (!connected) {
      return {
        canUpload: false,
        errorCode: 403 // Forbidden
      }
    }
    if (!["contributorAvatar", "task"].includes(externalRef.type)) {
      return {
        canUpload: false,
        errorCode: 400, // Bad Request
        errorMsg: `Invalid externalRef.type: ${externalRef.type}`
      }
    }
    if (externalRef.type === "contributorAvatar" && !isImage(file.mimetype)) {
      return {
        canUpload: false,
        errorCode: 400, // Bad Request
        errorMsg: "Only PNG, JPEG, GIF and WebP files are allowed."
      }
    }
    // TODO: Check the existence of `externalRef.id` in the database
    return {
      canUpload: true,
      ownerId: connected.contributorId
    }
  },

  async makeJsonResponseForUpload(req: Request, mediaId: string, overwritten: boolean) {
    let media = await findMedia({ mediaId })
    let modelUpd: ModelUpdate | undefined
    if (media) {
      let loader = new CargoLoader()
      putMediasToCargoLoader(loader, [media], overwritten ? "updated" : "created")
      modelUpd = loader.modelUpdate.toModelUpdate()
    }
    return {
      done: true,
      modelUpd
    }
  },

  canRead(req: Request, mediaRef: MediaRef) {
    return !!checkSession(req)
  },

  canDelete(req: Request, mediaRef: MediaRef) {
    return !!checkSession(req)
  },

  makeJsonResponseForDelete(req: Request, deletedMedia: Media) {
    let loader = new CargoLoader()
    for (let variantCode of Object.keys(deletedMedia.variants))
      loader.modelUpdate.markFragmentAs("MediaVariant", deletedMedia.variants[variantCode].id, "deleted")
    loader.modelUpdate.markFragmentAs("Media", deletedMedia.id, "deleted")

    let modelUpd = loader.modelUpdate.toModelUpdate()
    return {
      done: true,
      modelUpd
    }
  }
}

function isImage(imType: string) {
  return ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(imType)
}
