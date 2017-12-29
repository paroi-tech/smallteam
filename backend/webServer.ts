import * as path from "path"
import * as express from "express"
import * as multer from "multer"
import { Request, Response, Router, RequestHandler } from "express"

const session = require("express-session")
const makeSQLiteExpressStore = require("connect-sqlite3")

import { routeFetch, routeExec, routeBatch, routeWhoUse, routeGetFile, routeAddTaskAttachment, routeDeleteTaskAttachment } from "./api"
import { routeConnect, routeCurrentSession, routeDisconnect } from "./session"
import { routeChangePassword, routeResetPassword, routeChangeAvatar } from "./session"
import config from "../isomorphic/config"
import { SessionData } from "./backendContext/context"
import { mainDbConf } from "./utils/dbUtils"

const PORT = 3921

type RouteCb = (data: any, sessionData?: SessionData, req?: Request, res?: Response) => Promise<any>
type UploadRouteCb = (req: Request, res: Response) => Promise<any>
type RouteMethod = "get" | "post"

export function startWebServer() {
  let app = express()
  let upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 1024 * 1024 // 1 Mio
    }
  })

  let SQLiteExpressStore = makeSQLiteExpressStore(session)
  let { dir, file } = mainDbConf

  app.use(session({
      secret: "eishu6chod0keeyuwoo9uf<ierai4iejail1zie`",
      resave: false,
      saveUninitialized: true,
      store: new SQLiteExpressStore({
        table: "session",
        db: file,
        dir: dir
      }),
      cookie: {
        path: `${config.urlPrefix}/`,
        maxAge: 2 * 24 * 60 * 60 * 1000 // 2 days
      }
    })
  )

  let router = Router()

  declareRoute(router, "/api/session/connect", routeConnect, "post", true)
  declareRoute(router, "/api/session/current", routeCurrentSession, "post", true)
  declareRoute(router, "/reset-passwd", routeResetPassword, "post", true)
  declareRoute(router, "/api/session/disconnect", routeDisconnect, "post")
  declareRoute(router, "/api/session/change-password", routeChangePassword, "post")

  declareRoute(router, "/api/query", routeFetch, "post")
  declareRoute(router, "/api/exec", routeExec, "post")
  declareRoute(router, "/api/batch", routeBatch, "post")
  declareRoute(router, "/api/who-use", routeWhoUse, "post")

  declareRoute(router, "/get-file/:fId", routeGetFile, "get", true, false)
  declareUploadRoute(router, "/api/session/change-avatar", upload.single("avatar"), routeChangeAvatar)
  declareUploadRoute(router, "/api/add-task-attachment/:taskId", upload.single("attachment"), routeAddTaskAttachment)
  declareRoute(router, "/api/del-task-attachment/:taskId/:fId", routeDeleteTaskAttachment, "post", false, false)

  router.use(express.static(path.join(__dirname, "..", "www")))

  app.use(config.urlPrefix, router)

  app.get("*", (req, res) => write404(res))

  app.listen(PORT, function () {
    console.log(`The smallteam server is listening on port: ${PORT}, the path is: ${config.urlPrefix}...`)
  })
}

function wait(delayMs: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, delayMs))
}

function declareRoute(router: Router, route: string, cb: RouteCb, method: RouteMethod, isPublic = false, standaloneRoute = true) {
  router[method](route, function (req, res) {
    if (!isPublic && (!req.session || req.session.contributorId === undefined)) {
      console.log("404>>", req.session)
      write404(res)
      return
    }

    let body = ""

    req.on("data", data => body += data)
    req.on("end", () => {
      if (standaloneRoute)
        processRoute(req, res, body, cb)
      else
        processStandaloneRoute(req, res, body, cb)
    })
  })
}

async function processRoute(req: Request, res: Response, body: string, cb: RouteCb) {
  let reqData, cbResult: any

  try {
    try {
      reqData = JSON.parse(body)
    } catch (err) {
      throw new Error(`Invalid JSON request: ${body}`)
    }

    await wait(500) // TODO: Remove this line before to release!
    cbResult = await cb(reqData, req.session as any, req, res)
    writeServerResponse(res, 200, cbResult)
  } catch (err) {
    writeServerResponseError(res, err)
  }
}

async function processStandaloneRoute(req: Request, res: Response, body: string, cb: RouteCb) {
  try {
    cb(body, req.session as any, req, res)
  }  catch (err) {
    writeServerResponseError(res, err)
  }
}

function declareUploadRoute(router: Router, route: string, handler: RequestHandler, cb: UploadRouteCb) {
  router.post(route, handler, function (req, res) {
    if (!req.session || !req.session.contributorId) {
      console.log("404>>", req.session)
      write404(res)
      return
    }
    processUploadRoute(req, res, cb)
  })
}

async function processUploadRoute(req: Request, res: Response, cb: UploadRouteCb) {
  try {
    let resData = await cb(req, res)
    writeServerResponse(res, 200, resData)
  } catch (err) {
    writeServerResponseError(res, err)
  }
}

function writeServerResponseError(res: Response, err: Error) {
  writeServerResponse(res, 500, err.message)
  console.log("ERR", err, err.stack)
}

function writeServerResponse(res: Response, httpCode: number, data) {
  res.setHeader("Content-Type", "application/json")
  res.status(httpCode)
  res.send(JSON.stringify(data))
  res.end()
}

function write404(res: Response) {
  res.status(404)
  res.send("404 Not Found")
  res.end()
}
