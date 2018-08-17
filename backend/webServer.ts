import { Request, Response, Router } from "express"
import * as http from "http"
import * as path from "path"
import config from "../isomorphic/config"
import { SessionData } from "./session"
import { routeBatch, routeExec, routeFetch, routeWhoUse } from "./appModelBackend"
import { routeRegister, routeSendInvitation, routeGetPendingInvitations, routeCancelInvitation, routeResendInvitation } from "./invitation"
import { getSessionData, removeExpiredPasswordTokens, routeChangePassword, routeConnect, routeCurrentSession, routeEndSession, routeResetPassword, routeSendPasswordEmail, routeSetPassword } from "./session"
import { sessionDbConf, getMediaEngine } from "./utils/dbUtils"
import { wsEngineInit } from "./wsEngine"
import { ValidationError, AuthorizationError, getSubdomain } from "./utils/serverUtils"
import { routeCreateTeam, routeCheckTeamCode } from "./team"
import { MEDIAS_BASE_URL } from "./createMediaEngine";
import { declareRoutesMultiEngine } from "@fabtom/media-engine/upload";

import express = require("express")
import session = require("express-session")
import makeSQLiteExpressStore = require("connect-sqlite3")
import { serverConfig } from "./backendConfig"

type RouteCb = (subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) => Promise<any>
type MainSiteRouteCb = (data: any, sessionData?: SessionData, req?: Request, res?: Response) => Promise<any>

function getSubdomainOffset(mainDomain: string) {
  return (mainDomain.match(/\./g) || []).length + 1
}

export function startWebServer() {
  let { port, mainDomain } = serverConfig

  let app = express()
  app.set("subdomain offset", getSubdomainOffset(mainDomain))

  let server = http.createServer(app)

  let SQLiteExpressStore = makeSQLiteExpressStore(session)
  let { dir, file: db } = sessionDbConf

  let store = new SQLiteExpressStore({
    table: "session",
    db,
    dir
  })

  app.use(session({
    secret: "eishu6chod0keeyuwoo9uf<ierai4iejail1zie`",
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      path: `${config.urlPrefix}/`,
      maxAge: 2 * 24 * 60 * 60 * 1000 // 2 days
    }
  })
  )

  let router = Router()

  router.post("/api/team/create", makeMainSiteRouteHandler(routeCreateTeam))
  router.post("/api/team/check-team-id", makeMainSiteRouteHandler(routeCheckTeamCode))

  router.post("/api/session/connect", makeRouteHandler(routeConnect, true))
  router.post("/api/session/current", makeRouteHandler(routeCurrentSession, true))
  router.post("/api/session/disconnect", makeRouteHandler(routeEndSession, false))

  router.post("/api/registration/register", makeRouteHandler(routeRegister, true))
  router.post("/api/registration/send-invitation", makeRouteHandler(routeSendInvitation, false))
  router.post("/api/registration/resend-invitation", makeRouteHandler(routeResendInvitation, false))
  router.post("/api/registration/cancel-invitation", makeRouteHandler(routeCancelInvitation, false))
  router.post("/api/registration/fetch-invitations", makeRouteHandler(routeGetPendingInvitations, false))

  router.post("/api/registration/set-password", makeRouteHandler(routeSetPassword, false))
  router.post("/api/registration/change-password", makeRouteHandler(routeChangePassword, false))
  router.post("/api/registration/send-password-reset-mail", makeRouteHandler(routeSendPasswordEmail, true))
  router.post("/api/registration/reset-password", makeRouteHandler(routeResetPassword, true))

  router.post("/api/model/query", makeRouteHandler(routeFetch, false))
  router.post("/api/model/exec", makeRouteHandler(routeExec, false))
  router.post("/api/model/batch", makeRouteHandler(routeBatch, false))
  router.post("/api/model/who-use", makeRouteHandler(routeWhoUse, false))

  declareRoutesMultiEngine(router, {
    baseUrl: MEDIAS_BASE_URL
  }, async (req: Request, res: Response) => {
    let subdomain = await getSubdomain(req)
    if (subdomain)
      return (await getMediaEngine(subdomain)).uploadEngine
    write404(res)
  })

  router.use(express.static(path.join(__dirname, "..", "www")))

  app.use(config.urlPrefix, router)
  app.get("*", (req, res) => write404(res))

  wsEngineInit(server)
  server.listen(port, function () {
    console.log(`The smallteam server is listening on: ${getApplicationUrl()}`)
  })

  // Scheduled task to remove password reset tokens each day.
  setInterval(removeExpiredPasswordTokens, 3600 * 24 * 1000).unref()
}

function getApplicationUrl() {
  let protocol = serverConfig.ssl ? "https" : "http"
  let publicPort = serverConfig.publicPort || serverConfig.port
  let portSuffix = publicPort === 80 ? "" : `:${publicPort}`
  return `${protocol}://${serverConfig.mainDomain}${portSuffix}${config.urlPrefix || "/"}`
}

function makeRouteHandler(cb: RouteCb, isPublic: boolean) {
  return async function (req: Request, res: Response) {
    let subdomain = await getSubdomain(req)

    if (!subdomain) {
      write404(res)
      return
    }

    if (!isPublic) {
      try {
        let sessionData = await getSessionData(req)
        if (!sessionData || sessionData.subdomain !== subdomain) {
          write404(res)
          return
        }
      } catch (error) {
        write404(res)
        return
      }
    }

    let body: string | undefined
    try {
      body = await waitForRequestBody(req)
      // TODO: routes could specify status in their result.
      writeServerResponse(res, 200, await cb(subdomain, JSON.parse(body), req.session as any, req, res))
    } catch (err) {
      writeServerResponseError(res, err, body)
    }
  }
}

function makeMainSiteRouteHandler(cb: MainSiteRouteCb) {
  return async function (req: Request, res: Response) {
    if (await getSubdomain(req)) {
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
  console.log("[ERR]", err, err.stack, "Request body:", reqBody)
  let statusCode = err instanceof ValidationError ? 400 : (err instanceof AuthorizationError ? 404 : 500)
  let errorMsg: string
  if (statusCode >= 500 && statusCode < 600)
    errorMsg = "Server internal error"
  else if (statusCode === 404)
    errorMsg = "Resource not found"
  else if (statusCode === 400)
    errorMsg = "Bad request"
  else
    errorMsg = err.message
  writeServerResponse(res, statusCode, {
    error: errorMsg,
    request: reqBody
  })
}

function writeServerResponse(res: Response, httpCode: number, data) {
  // TODO: check if data contain a 'statusCode' property and use it as status code.
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
