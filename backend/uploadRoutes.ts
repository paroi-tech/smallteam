import { Request, Response } from "express"
import { SessionData } from "./backendContext/context";
import { getFileData, storeMedia, removeMedias, removeMedia } from "./uploadEngine";

export async function routeGetFile(_: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData || !req || !res)
    throw new Error("Required parameter missing in route callback")
  returnFile(getHttpParameter(req, "variantId"), res)
}

export async function routeDownloadFile(_: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData || !req || !res)
    throw new Error("Required parameter missing in route callback")
  returnFile(getHttpParameter(req, "variantId"), res, true)
}

async function returnFile(variantId: string, res: Response, asDownload = false) {
  let fileData = await getFileData(variantId)
  if (fileData) {
    res.type(fileData.imType)
    res.set("Content-Length", fileData.weightB.toString())
    if (asDownload)
      res.set("Content-Disposition", `attachment;filename=${fileData.name}`)
    res.write(fileData.binData)
  } else {
    res.status(404)
    res.send("404 Not Found")
  }
  res.end()
}

export async function routeAddTaskAttachment(req: Request, res: Response) {
  if (!req.file)
    throw new Error("No file provided")

  let sessionData: SessionData = req.session as any

  return {
    done: await storeMedia({
      file: req.file,
      externalRef: {
        type: "task",
        id: getHttpParameter(req, "taskId")
      },
      ownerId: sessionData.contributorId
    })
  }
}

export async function routeDeleteTaskAttachment(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("Required parameter missing in route callback")

  return {
    done: await removeMedia({
      variantId: getHttpParameter(req, "variantId")
    })
  }
}

function isImage(imType: string) {
  return ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(imType)
}

export async function routeChangeAvatar(req: Request, res: Response) {
  if (!req.file)
    throw new Error("No avatar provided")

  if (!isImage(req.file.mimetype))
    throw new Error("Only PNG, JPEG, GIF and WebP files are allowed.")

  let sessionData: SessionData = req.session as any
console.log(">>>>>>", req.params)
  return {
    done: await storeMedia({
      file: req.file,
      externalRef: {
        type: "contributorAvatar",
        id: getHttpParameter(req, "contributorId")
      },
      ownerId: sessionData.contributorId,
      overwrite: true
    })
  }
}

function getHttpParameter(req: Request, paramName: string): string {
  let param = req.params[paramName]
  if (param === undefined)
    throw new Error(`Missing HTTP parameter: ${paramName}`)
  return param
}