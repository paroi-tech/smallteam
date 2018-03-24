import { StorageContext, CanUpload } from "./uploadEngine/uploadEngine";
import { ExternalRef, MediaRef, Media, MulterFile } from "./uploadEngine/mediaStorage";
import { Request } from "express"
import { checkSession } from "./session";

//   type: "contributorAvatar",
//   id: contributorId

// type: "task",
// id: taskId

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

  makeJsonResponseForUpload(mediaId: string, overwritten: boolean) {
    // TODO: Here, implement a modelStorage response in order to update the frontend model
    return {
      done: true
    }
  },

  canRead(req: Request, mediaRef: MediaRef) {
    return !!checkSession(req)
  },

  canDelete(req: Request, mediaRef: MediaRef) {
    return !!checkSession(req)
  },

  makeJsonResponseForDelete(deletedMedia: Media) {
    // TODO: Here, implement a modelStorage response in order to clear the frontend model
    return {
      done: true
    }
  }
}

function isImage(imType: string) {
  return ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(imType)
}
