import { Request, Response, Router, RequestHandler } from "express"
import * as multer from "multer"
import { getFileData, storeMedia, removeMedias, removeMedia, ExternalRef, findMediaRef, MediaRef, findMedia, Media, Variant, MulterFile } from "./mediaStorage";

export interface CanUpload {
  canUpload: boolean
  /**
   * A valid HTTP code
   */
  errorCode?: number
  errorMsg?: string
  ownerId?: string
}

export interface StorageContext {
  canUpload(req: Request, externalRef: ExternalRef, overwrite: boolean, file: MulterFile): Promise<CanUpload> | CanUpload
  makeJsonResponseForUpload(mediaId: string, overwritten: boolean): Promise<object> | object

  canRead(req: Request, mediaRef: MediaRef): Promise<boolean> | boolean

  canDelete(req: Request, mediaRef: MediaRef): Promise<boolean> | boolean
  makeJsonResponseForDelete(deletedMedia: Media): Promise<object> | object
}

export function declareMediaRoutes(router: Router, context: StorageContext) {
  let upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 1024 * 1024 * 20 // 20 MB
    }
  })
  router.post("/medias", upload.single("f"), makeUploadRouteHandler(context))
  router.delete("/medias", makeDeleteRouteHandler(context))
  router.get("/medias/:year/:variantId/:fileName", makeGetRouteHandler(context))
}

export function getFileUrl(media: Media, variant: Variant, urlPrefix = "") {
  let year = new Date(media.ts).getFullYear()
  return `${urlPrefix}/medias/${year}/${variant.id}/${encodeURIComponent(variant.fileName)}`
}

function makeUploadRouteHandler(context: StorageContext) {
  return async function (req: Request, res: Response) {
    try {
      // Check the parameters
      if (!req.file)
        return writeError(res, 400, "Missing file")
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
        return writeError(res, 400, err.message)
      }
      // Validate the access
      let { canUpload, ownerId, errorCode, errorMsg } = await context.canUpload(req, externalRef, overwrite, req.file)
      if (!canUpload)
        return writeError(res, errorCode || 403, errorMsg)
      // Store the media
      let { mediaId, overwritten } = await storeMedia({
        file: req.file,
        externalRef,
        ownerId: ownerId,
        overwrite
      })
      writeJsonResponse(res, 200, await context.makeJsonResponseForUpload(mediaId, overwritten))
    } catch (err) {
      writeServerError(res, err)
    }
  }
}

function makeGetRouteHandler(context: StorageContext) {
  return async function (req: Request, res: Response) {
    try {
      // Check the parameters
      let variantId: string
      try {
        variantId = getRouteParameter(req, "variantId")
      } catch (err) {
        return writeError(res, 400, err.message)
      }
      // Validate the access
      let mediaRef = await findMediaRef({ variantId })
      if (!mediaRef || !await context.canRead(req, mediaRef))
        return writeError(res, 404)
      // Serve the file
      returnFile(variantId, res, !!req.query.download)
    } catch (err) {
      writeServerError(res, err)
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

      // Check the parameters
      let mediaId: string
      try {
        let options = await waitRequestBodyAsJson(req)
        mediaId = getUploadMetaValue(options, ["mediaId"], "string")
      } catch (err) {
        return writeError(res, 400, err.message)
      }
      // Validate the access
      let media = await findMedia({ mediaId })
      if (!media || !await context.canDelete(req, { externalRef: media.externalRef, ownerId: media.ownerId }))
        return writeError(res, 404)
      // Delete the file
      await removeMedia({ mediaId })
      writeJsonResponse(res, 200, await context.makeJsonResponseForDelete(media))
    } catch (err) {
      writeServerError(res, err)
    }
  }
}

async function waitRequestBodyAsJson(req: Request): Promise<any> {
  let result = await new Promise<string>((resolve, reject) => {
    let body: string[] = []
    req.on("data", chunk => body.push(typeof chunk === "string" ? chunk : chunk.toString()))
    req.on("error", err => {
      reject(err)
    })
    req.on("end", () => {
      resolve(body.join(""))
    })
  })
  return JSON.parse(result)
}

// --
// -- Utils
// --

function writeJsonResponse(res: Response, httpCode: number, data) {
  res.setHeader("Content-Type", "application/json")
  res.status(httpCode)
  res.send(JSON.stringify(data))
  res.end()
}

function writeServerError(res: Response, err: Error, reqBody?: string) {
  console.log("[ERR]", err, err.stack, reqBody)
  writeError(res, 500, `Error: ${err.message}\nRequest: ${reqBody}`)
}

function writeError(res: Response, httpCode: number, message?: string) {
  res.status(httpCode)
  res.send(message || httpErrorMessage(httpCode))
  res.end()
}

function httpErrorMessage(httpCode: number) {
  switch (httpCode) {
    case 400:
      return "400 Bad Request"
    case 403:
      return "403 Forbidden"
    case 404:
      return "404 Not Found"
    case 500:
      return "500 Internal Server Error"
    default:
      return `Error ${httpCode}`
  }
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
  if (cur === undefined) {
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
