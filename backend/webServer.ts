import * as http from "http"
import * as path from "path"
import * as express from "express"
import { Request, Response, Router, RequestHandler } from "express"

const session = require("express-session")
const makeSQLiteExpressStore = require("connect-sqlite3")

import config from "../isomorphic/config"
import { routeFetch, routeExec, routeBatch, routeWhoUse } from "./modelStorage"
// import { routeGetFile, routeDownloadFile, routeAddTaskAttachment, routeDeleteTaskAttachment, routeChangeAvatar } from "./uploadRoutes"
import { routeConnect, routeCurrentSession, routeDisconnect } from "./session"
import { routeChangePassword, routeSetPassword, routeResetPassword } from "./session"
import { SessionData } from "./backendContext/context"
import { mainDbConf } from "./utils/dbUtils"
import { wsEngineInit } from "./wsEngine"
import { removeExpiredTokens } from "./mail"

const PORT = 3921

type RouteCb = (data: any, sessionData?: SessionData, req?: Request, res?: Response) => Promise<any>
type UploadRouteCb = (req: Request, res: Response) => Promise<any>
type RouteMethod = "get" | "post"

export function startWebServer() {
  let app = express()
  let server = http.createServer(app)

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

  router.post("/api/session/connect", makeRouteHandler(routeConnect, true))
  router.post("/api/session/current", makeRouteHandler(routeCurrentSession, true))
  router.post("/reset-passwd", makeRouteHandler(routeResetPassword, true))

  router.post("/api/session/disconnect", makeRouteHandler(routeDisconnect, false))
  router.post("/api/session/change-password", makeRouteHandler(routeChangePassword, false))
  router.post("/api/session/set-password", makeRouteHandler(routeSetPassword, false))

  router.post("/api/query", makeRouteHandler(routeFetch, false))
  router.post("/api/exec", makeRouteHandler(routeExec, false))
  router.post("/api/batch", makeRouteHandler(routeBatch, false))
  router.post("/api/who-use", makeRouteHandler(routeWhoUse, false))

  // declareRoute(router, "/get-file/:variantId/:fileName", routeGetFile, "get", false, true)
  // declareRoute(router, "/download-file/:variantId/:fileName", routeDownloadFile, "get", false, true)
  // declareRoute(router, "/api/delete-attachment/:taskId/:variantId", routeDeleteTaskAttachment, "post", false, true)

  // declareUploadRoute(router, "/api/session/change-avatar", upload.single("avatar"), routeChangeAvatar)
  // declareUploadRoute(router, "/api/add-task-attachment/:taskId", upload.single("attachment"), routeAddTaskAttachment)

  router.use(express.static(path.join(__dirname, "..", "www")))

  app.use(config.urlPrefix, router)
  app.get("*", (req, res) => write404(res))

  wsEngineInit(server)
  server.listen(PORT, function () {
    console.log(`The smallteam server is listening on port: ${PORT}, the path is: ${config.urlPrefix}...`)
  })

  // Scheduled task to removed expired mail challenges.
  setInterval(removeExpiredTokens, 3600 * 24 * 1000 /* 1 day */)
}

function wait(delayMs: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, delayMs))
}

function makeRouteHandler(cb: RouteCb, isPublic: boolean) {
  return function (req, res) {
    if (!isPublic && (!req.session || req.session.contributorId === undefined)) {
      // console.log("404>>", req.session)
      write404(res)
      return
    }

    let body = ""
    req.on("data", data => body += data)
    req.on("end", () => {
      processJsonRequest(req, res, body, cb)
    })
  }
}

async function processJsonRequest(req: Request, res: Response, body: string, cb: RouteCb) {
  try {
    let reqData = JSON.parse(body)
    // await wait(500) // TODO: Remove this line before to release!
    writeServerResponse(res, 200, await cb(reqData, req.session as any, req, res))
  } catch (err) {
    writeServerResponseError(res, err, body)
  }
}

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

function write404(res: Response) {
  res.status(404)
  res.send("404 Not Found")
  res.end()
}
