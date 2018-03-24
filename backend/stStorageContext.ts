import { StorageContext, CanUpload } from "./uploadEngine/uploadEngine";
import { ExternalRef, MediaRef, Media, MulterFile } from "./uploadEngine/mediaStorage";
import { Request } from "express"
import { checkSession } from "./session";

//   type: "contributorAvatar",
//   id: contributorId

// type: "task",
// id: taskId

export const stStorageContext: StorageContext = {
  async canUpload(req: Request, externalRef: ExternalRef, overwrite: boolean, file: MulterFile): Promise<CanUpload> {
    let connected = await checkSession(req)
    if (!connected) {
      return {
        canUpload: false,
        errorCode: 403 // Forbidden
      }
    }
    if (externalRef.type === "contributorAvatar" && !isImage(file.mimetype)) {
      return {
        canUpload: false,
        errorCode: 400, // Bad Request
        errorMsg: "Only PNG, JPEG, GIF and WebP files are allowed."
      }
    }
    return {
      canUpload: true,
      ownerId: connected.contributorId
    }
  },

  async makeJsonResponseForUpload(mediaId: string, overwritten: boolean): Promise<object> {

  },

  async canRead(req: Request, mediaRef: MediaRef): Promise<boolean> {
    return !!await checkSession(req)
  },

  async canDelete(req: Request, mediaRef: MediaRef): Promise<boolean> {
    return !!await checkSession(req)
  },

  async makeJsonResponseForDelete(deletedMedia: Media): Promise<object> {

  }
}

function isImage(imType: string) {
  return ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(imType)
}
