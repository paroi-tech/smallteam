import { Request, Response } from "express"
import * as multer from "multer"

type File = Express.Multer.File
type ImageFilterCb = (err: Error | null, acceptFile: boolean) => void
type FileFilter = (req: Request, file: File, cb: ImageFilterCb) => void

export function checkAvatarFileType(file: File): boolean {
  return file.originalname.match(/\.(jpg|jpeg|png|gif)$/) !== null
}

export async function routeChangeAvatar(req: Request, res: Response) {
  if (!req.file)
    throw new Error("No avatar provided")

  let file = req.file
  if (!checkAvatarFileType(file))
    throw new Error("Only PNG, JPEG and GIF files are allowed.")

  console.log("Got file", file.mimetype, file.filename, file.path)

  return {
    done: true
  }
}
