import * as http from "http"
import * as path from "path"
const express = require("express")
import { Request, Response, Router } from "express"

const session = require("express-session")
const makeSQLiteExpressStore = require("connect-sqlite3")

import config from "../isomorphic/config"
import { routeFetch, routeExec, routeBatch, routeWhoUse } from "./modelStorage"
import { routeConnect, routeCurrentSession, routeDisconnect } from "./session"
import { routeChangePassword, routeSetPassword, routeResetPassword, routeSendPasswordResetMail } from "./session"
import { SessionData } from "./backendContext/context"
import { mainDbConf, mediaEngine } from "./utils/dbUtils"
import { wsEngineInit } from "./wsEngine"
import { removeExpiredRegistrationTokens } from "./mail"
import { MEDIAS_REL_URL } from "./createMediaEngine"
import { wait } from "../isomorphic/libraries/helpers"

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
  router.post("/api/session/send-password-reset-mail", makeRouteHandler(routeSendPasswordResetMail, true))
  // TODO: Add route for new user account activation
  router.post("/reset-password", makeRouteHandler(routeResetPassword, true))

  router.post("/api/session/disconnect", makeRouteHandler(routeDisconnect, false))
  router.post("/api/session/change-password", makeRouteHandler(routeChangePassword, false))
  router.post("/api/session/set-password", makeRouteHandler(routeSetPassword, false))

  router.post("/api/query", makeRouteHandler(routeFetch, false))
  router.post("/api/exec", makeRouteHandler(routeExec, false))
  router.post("/api/batch", makeRouteHandler(routeBatch, false))
  router.post("/api/who-use", makeRouteHandler(routeWhoUse, false))

  mediaEngine.uploadEngine.declareRoutes(router, {
    baseUrl: MEDIAS_REL_URL
  })

  router.use(express.static(path.join(__dirname, "..", "www")))

  app.use(config.urlPrefix, router)
  app.get("*", (req, res) => write404(res))

  wsEngineInit(server)
  server.listen(PORT, function () {
    console.log(`The smallteam server is listening on port: ${PORT}, the path is: ${config.urlPrefix}...`)
  })

  // Scheduled task to remove password reset tokens.
  setInterval(removeExpiredRegistrationTokens, 3600 * 24 * 1000 /* 1 day */)
}

function makeRouteHandler(cb: RouteCb, isPublic: boolean) {
  return async function (req: Request, res: Response) {
    if (!isPublic && (!req.session || req.session.contributorId === undefined)) {
      write404(res)
      return
    }

    let body: string | undefined
    try {
      body = await waitForRequestBody(req)
      writeServerResponse(res, 200, await cb(JSON.parse(body), req.session as any, req, res))
    } catch (err) {
      writeServerResponseError(res, err, body)
    }
  }
}

function writeServerResponseError(res: Response, err: Error, reqBody?: string) {
  console.log("[ERR]", err, err.stack, reqBody)
  writeServerResponse(res, 500, {
    error: err.message,
    request: reqBody
  })
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

function waitForRequestBody(req: Request): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let body: string[] = []
    req.on("data", chunk => body.push(typeof chunk === "string" ? chunk : chunk.toString()))
    req.on("error", err => {
      reject(err)
    })
    req.on("end", () => {
      resolve(body.join(""))
    })
  })
}
