import { ExternalRef, MulterFile, MediaRef, Media, Variant } from "../mediaStorage"
import { Request, Response, Router } from "express"

export interface CanUpload {
  canUpload: boolean
  /**
   * A valid HTTP code
   */
  errorCode?: number
  errorMsg?: string
  ownerId?: string
}

export interface UploadEngineManager {
  canUpload(req: Request, externalRef: ExternalRef, overwrite: boolean, file: MulterFile): Promise<CanUpload> | CanUpload
  makeJsonResponseForUpload(req: Request, mediaId: string, overwritten: boolean): Promise<object> | object

  canRead(req: Request, mediaRef: MediaRef): Promise<boolean> | boolean

  canDelete(req: Request, mediaRef: MediaRef): Promise<boolean> | boolean
  makeJsonResponseForDelete(req: Request, deletedMedia: Media): Promise<object> | object
}
