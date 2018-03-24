import { Request, Response, Router, RequestHandler } from "express"
import * as multer from "multer"
import { getFileData, storeMedia, removeMedias, removeMedia, ExternalRef, findMediaRef, MediaRef, findMedia, Media } from "./mediaStorage";

let upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 20 // 20 MB
  }
})

export interface CanUpload {
  canUpload: boolean
  ownerId: string | undefined
}

export interface StorageContext {
  canUpload(externalRef: ExternalRef, overwrite: boolean): Promise<CanUpload>
  makeJsonResponseForUpload(mediaId: string, overwritten: boolean): Promise<object>

  canRead(mediaRef: MediaRef): Promise<boolean>

  canDelete(mediaRef: MediaRef): Promise<boolean>
  makeJsonResponseForDelete(deletedMedia: Media): Promise<object>
}

export function declareRoutes(router: Router, validator: StorageContext) {
  router.post("/medias", makeUploadRouteHandler(validator))
  router.get("/medias/:year/:variantId/*", makeGetRouteHandler(validator))
  router.delete("/medias/:year/:variantId/*", makeDeleteRouteHandler(validator))
}

function makeUploadRouteHandler(context: StorageContext) {
  return async function (req: Request, res: Response) {
    try {
      // Get the meta
      let externalRef: ExternalRef
      let overwrite: boolean
      try {
        let meta = getMulterParameterAsJson(req, "meta")
        externalRef = {
          type: getUploadMetaValue(meta, ["ref", "type"], "string"),
          id: getUploadMetaValue(meta, ["ref", "id"], "string")
        }
        overwrite = !!getUploadMetaValue(meta, ["overwrite"], "boolean", true)
      } catch (err) {
        write400(res, err.message)
        return
      }
      // Validate the access
      let { canUpload, ownerId } = await context.canUpload(externalRef, overwrite)
      if (!canUpload) {
        write403(res)
        return
      }
      // Store the media
      let { mediaId, overwritten } = await storeMedia({
        file: req.file,
        externalRef,
        ownerId: ownerId,
        overwrite
      })
      writeServerResponse(res, 200, await context.makeJsonResponseForUpload(mediaId, overwritten))
    } catch (err) {
      writeServerResponseError(res, err)
    }
  }
}

function makeGetRouteHandler(context: StorageContext) {
  return async function (req: Request, res: Response) {
    try {
      // Get the meta
      let variantId: string
      try {
        variantId = getRouteParameter(req, "variantId")
      } catch (err) {
        return write400(res, err.message)
      }
      // Validate the access
      let mediaRef = await findMediaRef({ variantId })
      if (!mediaRef || !await context.canRead(mediaRef))
        return write404(res)
      // Serve the file
      returnFile(variantId, res, !!req.query.download)
    } catch (err) {
      writeServerResponseError(res, err)
    }
  }
}

async function returnFile(variantId: string, res: Response, asDownload = false) {
  let fileData = await getFileData(variantId)
  if (fileData) {
    res.type(fileData.imType)
    res.set("Content-Length", fileData.weightB.toString())
    if (asDownload)
      res.set("Content-Disposition", `attachment;filename=${fileData.fileName}`)
    res.write(fileData.binData)
  } else {
    res.status(404)
    res.send("404 Not Found")
  }
  res.end()
}

function makeDeleteRouteHandler(context: StorageContext) {
  return async function (req: Request, res: Response) {
    try {
      // Get the meta
      let variantId: string
      try {
        variantId = getRouteParameter(req, "variantId")
      } catch (err) {
        return write400(res, err.message)
      }
      // Validate the access
      let media = await findMedia({ variantId })
      if (!media || !await context.canDelete({ externalRef: media.externalRef, ownerId: media.ownerId }))
        return write404(res)
      // Delete the file
      await removeMedia({ variantId })
      writeServerResponse(res, 200, await context.makeJsonResponseForDelete(media))
    } catch (err) {
      writeServerResponseError(res, err)
    }
  }
}

// --
// -- Utils
// --

function writeServerResponseError(res: Response, err: Error, reqBody?: string) {
  writeServerResponse(res, 500, `Error: ${err.message}\nRequest: ${reqBody}`)
  console.log("[ERR]", err, err.stack, reqBody)
}

function writeServerResponse(res: Response, httpCode: number, data) {
  res.setHeader("Content-Type", "application/json")
  res.status(httpCode)
  res.send(JSON.stringify(data))
  res.end()
}

function write400(res: Response, message?: string) {
  res.status(400)
  res.send(`400 Bad Request${message ? `\n${message}` : ""}`)
  res.end()
}

function write403(res: Response) {
  res.status(403)
  res.send("403 Forbidden")
  res.end()
}

function write404(res: Response) {
  res.status(404)
  res.send("404 Not Found")
  res.end()
}



//   type: "contributorAvatar",
//   id: contributorId

// type: "task",
// id: taskId

// declareRoute(router, "/get-file/:variantId/:fileName", routeGetFile, "get", false, true)
// // declareRoute(router, "/download-file/:variantId/:fileName", routeDownloadFile, "get", false, true)
// declareRoute(router, "/api/delete-attachment/:taskId/:variantId", routeDeleteTaskAttachment, "post", false, true)

// declareUploadRoute(router, "/api/session/change-avatar", upload.single("avatar"), routeChangeAvatar)
// declareUploadRoute(router, "/api/add-task-attachment/:taskId", upload.single("attachment"), routeAddTaskAttachment)

// function declareRoute(r: Router, path: string, cb: RouteCb, method: RouteMethod, isPublic: boolean, standalone: boolean) {
//   r[method](path, function (req, res) {
//     if (!isPublic && (!req.session || req.session.contributorId === undefined)) {
//       console.log("404>>", req.session)
//       write404(res)
//       return
//     }

//     let body = ""
//     req.on("data", data => body += data)
//     req.on("end", () => {
//       processStandaloneRoute(req, res, body, cb)
//     })
//   })
// }

// function declareUploadRoute(router: Router, route: string, handler: RequestHandler, cb: UploadRouteCb) {
//   router.post(route, handler, function (req, res) {
//     if (!req.session || !req.session.contributorId) {
//       console.log("404>>", req.session)
//       write404(res)
//       return
//     }
//     processUploadRoute(req, res, cb)
//   })
// }


// async function processStandaloneRoute(req: Request, res: Response, body: string, cb: RouteCb) {
//   try {
//     cb(body, req.session as any, req, res)
//   } catch (err) {
//     writeServerResponseError(res, err)
//   }
// }


// async function processUploadRoute(req: Request, res: Response, cb: UploadRouteCb) {
//   try {
//     let resData = await cb(req, res)
//     writeServerResponse(res, 200, resData)
//   } catch (err) {
//     writeServerResponseError(res, err)
//   }
// }

// export async function routeAddTaskAttachment(req: Request, res: Response) {
//   if (!req.file)
//     throw new Error("No file provided")

//   let sessionData: SessionData = req.session as any

//   await storeMedia({
//     file: req.file,
//     externalRef: {
//       type: "task",
//       id: getRouteParameter(req, "taskId")
//     },
//     ownerId: sessionData.contributorId
//   })

//   return {
//     done: true
//   }
// }

// export async function routeChangeAvatar(req: Request, res: Response) {
//   if (!req.file)
//     throw new Error("No avatar provided")

//   if (!isImage(req.file.mimetype))
//     throw new Error("Only PNG, JPEG, GIF and WebP files are allowed.")

//   let sessionData: SessionData = req.session as any

//   await storeMedia({
//     file: req.file,
//     externalRef: {
//       type: "contributorAvatar",
//       id: getMulterParameter(req, "contributorId")
//     },
//     ownerId: sessionData.contributorId,
//     overwrite: true
//   })

//   return {
//     done: true
//   }
// }

// export async function routeDeleteTaskAttachment(_: any, sessionData?: SessionData, req?: Request, res?: Response) {
//   if (!req)
//     throw new Error("Required parameter missing in route callback")

//   return {
//     done: await removeMedia({
//       variantId: getRouteParameter(req, "variantId")
//     })
//   }
// }

function isImage(imType: string) {
  return ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(imType)
}

function getRouteParameter(req: Request, paramName: string, allowEmpty = false): string {
  let val = req.params[paramName]
  if (val === undefined)
    throw new Error(`Missing HTTP parameter: ${paramName}`)
  if (!allowEmpty && val === "")
    throw new Error(`Empty HTTP parameter: ${paramName}`)
  return val
}

function getUploadMetaValue<T = any>(meta, keys: string[], checkType: string, optional = false): T {
  let cur = meta
  for (let key of keys) {
    if (!cur)
      throw new Error(`Missing meta value for "${keys.join(".")}" in: ${JSON.stringify(meta)}`)
    cur = cur[key]
  }
  if (cur !== undefined) {
    if (!optional)
      throw new Error(`Missing meta value for "${keys.join(".")}" in: ${JSON.stringify(meta)}`)
  } else if (typeof cur !== checkType)
    throw new Error(`Invalid ${checkType} meta value for "${keys.join(".")}": ${typeof cur}`)
  return cur
}

function getMulterParameterAsJson(req: Request, paramName: string): any {
  let param = req.body[paramName]
  if (param === undefined)
    throw new Error(`Missing form parameter: ${paramName}`)
  try {
    return JSON.parse(param)
  } catch (err) {
    throw new Error(`Invalid JSON for form parameter: ${paramName}: ${err.message}`)
  }
}
