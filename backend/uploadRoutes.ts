import { Request, Response } from "express"
import { SessionData } from "./backendContext/context";
import { fetchFileById, checkAttachmentType, storeFile, fetchSingleRelatedFileInfo, deleteFile, checkImageType, fetchRelatedFilesInfo, updateFile } from "./uploadEngine";

export async function routeGetFile(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData || !req || ! res)
    throw new Error("Required parameter missing in route callback")
  if (!req.params.fId)
    throw new Error("Missing file ID in request")

  let f = await fetchFileById(req.params.fId)
  if (f) {
    let info = f.info
    res.type(info.mimeType)
    res.set("Content-Length", info.weight.toString())
    res.write(f.buffer)
  } else {
    res.status(404)
    res.send("404 Not Found")
  }
  res.end()
}

export async function routeDownloadFile(download: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData || !req || ! res)
    throw new Error("Required parameter missing in route callback")
  if (!req.params.fId)
    throw new Error("Missing file ID in request")

  let f = await fetchFileById(req.params.fId)
  if (f) {
    let info = f.info
    res.type(info.mimeType)
    res.set("Content-Length", info.weight.toString())
    res.set("Content-Disposition", `attachment;filename=${info.name}`)
    res.write(f.buffer)
  } else {
    res.status(404)
    res.send("404 Not Found")
  }
  res.end()
}

export async function routeAddTaskAttachment(req: Request, res: Response) {
  if (!req.params.taskId)
    throw new Error("Missing task ID in request")
  if (!req.file)
    throw new Error("No file provided")
  if (!checkAttachmentType(req.file))
    throw new Error("Only PDF, PNG, JPEG and GIF files are allowed.")

  let f = req.file
  let sessionData: SessionData = req.session as any
  let contributorId = sessionData.contributorId
  let taskId = req.params.taskId

  return await storeFile(f, "task", taskId, contributorId)
}

export async function routeDeleteTaskAttachment(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!req)
    throw new Error("Required parameter missing in route callback")
  if (!req.params.taskId || !req.params.fId)
    throw new Error("Missing task ID or file ID in request")

  let info = fetchSingleRelatedFileInfo("task", req.params.taskId, req.params.fId)
  if (info)
    return await deleteFile(req.params.fId)
  else
    return { done: false }
}

export async function routeChangeAvatar(req: Request, res: Response) {
  if (!req.file)
    throw new Error("No avatar provided")
  if (!checkImageType(req.file))
    throw new Error("Only PNG, JPEG and GIF files are allowed.")

  let f = req.file
  let sessionData: SessionData = req.session as any
  let contributorId = sessionData.contributorId
  let arr = await fetchRelatedFilesInfo("contributorAvatar", contributorId)

  if (arr.length !== 0)
    return await updateFile(f, arr[0].id, contributorId)
  else
    return await storeFile(f, "contributorAvatar", contributorId, contributorId)
}
