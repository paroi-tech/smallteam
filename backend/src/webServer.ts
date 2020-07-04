import { declareRoutesMultiEngine } from "@paroi/media-engine/upload"
import express, { Request, Response, Router } from "express"
import session from "express-session"
import * as http from "http"
import * as path from "path"
import { appLog, conf, packageDir } from "./context"
import {
  routeActivateGithubWebhook, routeCreateGithubWebhook, routeDeactivateGithubWebhook,
  routeDeleteGithubWebhook, routeFetchGithubWebhooks, routeGetGithubWebhookSecret, routeProcessGithubNotification
} from "./notifications"
import { getPlatformHtml, getPlatformSupportHtml } from "./platform/frontend"
import { routeActivateTeam, routeCheckTeamSubdomain, routeCreateTeam } from "./platform/platform"
import { getRegistrationHtml } from "./registration/frontend"
import { routeCancelInvitation, routeGetPendingInvitations, routeRegister, routeResendInvitation, routeSendInvitation } from "./registration/registration"
import {
  hasSession, removeExpiredPasswordTokens, routeChangePassword, routeConnect, routeCurrentSession, routeEndSession,
  routeResetPassword, routeSendPasswordEmail, routeSetPassword, SessionData
} from "./session"
import { routeBatch, routeExec, routeFetch, routeWhoUse } from "./team/appModelBackend"
import { MEDIAS_BASE_URL } from "./team/createMediaEngine"
import { getTeamHtml } from "./team/frontend"
import { broadcastModelUpdate, wsEngineClose, wsEngineInit } from "./team/wsEngine"
import { getMediaEngine, getSessionDbConf } from "./utils/dbUtils"
import { AuthorizationError, getConfirmedSubdomain, getMainDomainUrl, getSubdirUrl, isMainDomain, ValidationError } from "./utils/serverUtils"

import makeSQLiteExpressStore = require("connect-sqlite3")

type RouteCb = (subdomain: string, data: any, sessionData?: SessionData, req?: Request, res?: Response) => Promise<any>
type MainSiteRouteCb = (data: any, sessionData?: SessionData, req?: Request, res?: Response) => Promise<any>

function getSubdomainOffset(domain: string) {
  return (domain.match(/\./g) || []).length + 1
}

let server: http.Server | undefined

export async function startWebServer() {
  const { port, domain } = conf

  const app = express()
  app.set("subdomain offset", getSubdomainOffset(domain))

  server = http.createServer(app)
  // tslint:disable-next-line:variable-name
  const SQLiteExpressStore = makeSQLiteExpressStore(session)
  const { dir, file: db } = getSessionDbConf()

  const store = new SQLiteExpressStore({
    table: "session",
    db,
    dir
  })

  const sessionMiddleware = session({
    secret: "eishu6chod0keeyuwoo9uf<ierai4iejail1zie`",
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      path: `${getSubdirUrl()}/`,
      maxAge: 2 * 24 * 60 * 60 * 1000 // 2 days
    }
  })
  app.use(sessionMiddleware)

  const router = Router()

  router.post("/api/team/create", makeMainSiteRouteHandler(routeCreateTeam))
  router.post("/api/team/check-subdomain", makeMainSiteRouteHandler(routeCheckTeamSubdomain))
  router.post("/api/team/activate", makeMainSiteRouteHandler(routeActivateTeam))

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
  router.post("/api/model/exec", makeRouteHandler(routeExec, false, true))
  router.post("/api/model/batch", makeRouteHandler(routeBatch, false, false))
  router.post("/api/model/who-use", makeRouteHandler(routeWhoUse, false))

  router.post("/api/notifications/github/fetch-webhooks", makeRouteHandler(routeFetchGithubWebhooks, false))
  router.post("/api/notifications/github/create-webhook", makeRouteHandler(routeCreateGithubWebhook, false))
  router.post("/api/notifications/github/activate-webhook", makeRouteHandler(routeActivateGithubWebhook, false))
  router.post("/api/notifications/github/deactivate-webhook", makeRouteHandler(routeDeactivateGithubWebhook, false))
  router.post("/api/notifications/github/get-webhook-secret", makeRouteHandler(routeGetGithubWebhookSecret, false))
  router.post("/api/notifications/github/delete-webhook", makeRouteHandler(routeDeleteGithubWebhook, false))
  router.post("/api/notifications/github/webhook/:uuid", makeRouteHandler(routeProcessGithubNotification, true))

  declareRoutesMultiEngine(router, {
    baseUrl: MEDIAS_BASE_URL
  }, async (req: Request, res: Response) => {
    const subdomain = await getConfirmedSubdomain(req)
    if (subdomain)
      return (await getMediaEngine(subdomain)).uploadEngine
    write404(res)
  })

  router.use(express.static(path.join(packageDir, "static")))
  router.use(express.static(path.join(packageDir, "static-bundles")))

  // await configureGetRouteToFile(
  //   router,
  //   "platform.bundle.js",
  //   path.join(packageDir, "public-platform", "platform.bundle.js")
  // )

  router.get("/", async (req, res) => {
    if (isMainDomain(req))
      writeHtmlResponse(res, getPlatformHtml())
    else if (await getConfirmedSubdomain(req))
      writeHtmlResponse(res, getTeamHtml())
    else
      write404(res)
  })

  router.get("/support", (req, res, next) => {
    if (isMainDomain(req))
      writeHtmlResponse(res, getPlatformSupportHtml())
    else
      next()
  })

  router.get("/registration", async (req, res, next) => {
    if (await getConfirmedSubdomain(req))
      writeHtmlResponse(res, getRegistrationHtml())
    else
      next()
  })

  router.get("/new-team", (req, res, next) => {
    if (isMainDomain(req))
      writeHtmlResponse(res, getPlatformHtml())
    else
      next()
  })

  app.use(getSubdirUrl(), router)
  app.get("*", (req, res) => write404(res))

  wsEngineInit(server, sessionMiddleware)

  await new Promise(resolve => {
    server!.listen(port, resolve)
  })
  appLog.info(`The server is listening on: ${getMainDomainUrl()}/`)

  // Scheduled task to remove password reset tokens each day.
  const timer = setInterval(removeExpiredPasswordTokens, 3600 * 24 * 1000) as any
  timer.unref()
}

export async function stopServer() {
  await wsEngineClose()
  await new Promise((resolve, reject) => {
    if (!server) {
      resolve()
      return
    }
    server.close(err => {
      if (err)
        reject(err)
      else
        resolve()
    })
  })
}

function makeRouteHandler(cb: RouteCb, isPublic: boolean, notifyWs = false) {
  return async function (req: Request, res: Response) {
    const subdomain = await getConfirmedSubdomain(req)

    if (!subdomain) {
      write404(res)
      return
    }

    try {
      if (!isPublic && !await hasSession(req, subdomain)) {
        write404(res)
        return
      }
    } catch (err) {
      writeServerResponseError(res, err)
      return
    }

    let body: string | undefined

    try {
      // FIXME: route cb should be able to set response object status code. REALLY!!!
      body = await waitForRequestBody(req)
      req["rawBody"] = body

      const data = await cb(subdomain, JSON.parse(body), req.session as any, req, res)

      writeJsonResponse(res, 200, data)
      if (!isPublic && notifyWs && req.session)
        broadcastModelUpdate(subdomain, req.session.id, data)
    } catch (err) {
      writeServerResponseError(res, err, body)
    }
  }
}

function makeMainSiteRouteHandler(cb: MainSiteRouteCb) {
  return async function (req: Request, res: Response) {
    if (!isMainDomain(req)) {
      write404(res)
      return
    }

    let body: string | undefined

    try {
      body = await waitForRequestBody(req)
      req["rawBody"] = body
      writeJsonResponse(res, 200, await cb(JSON.parse(body), req.session as any, req, res))
    } catch (err) {
      writeServerResponseError(res, err, body)
    }
  }
}

function writeServerResponseError(res: Response, err: Error, reqBody?: string) {
  appLog.error("[ERR]", err, err.stack, "Request body:", reqBody)
  const statusCode = err instanceof ValidationError ? 400 : (err instanceof AuthorizationError ? 404 : 500)
  let errorMsg: string
  if (statusCode >= 500 && statusCode < 600)
    errorMsg = "Server internal error"
  else if (statusCode === 404)
    errorMsg = "Resource not found"
  else if (statusCode === 400)
    errorMsg = "Bad request"
  else
    errorMsg = err.message
  writeJsonResponse(res, statusCode, {
    error: errorMsg,
    request: reqBody
  })
}

function writeJsonResponse(res: Response, httpCode: number, data: unknown) {
  // FIXME: check if data contain a 'statusCode' property and use it as status code.
  res.setHeader("Content-Type", "application/json")
  res.status(httpCode)
  res.send(JSON.stringify(data))
  res.end()
}

function writeHtmlResponse(res: Response, html: string) {
  res.setHeader("Content-Type", "text/html")
  res.status(200)
  res.send(html)
  res.end()
}

// function writeResponse(res: Response, content: string, mediaType: string) {
//   res.setHeader("Content-Type", mediaType)
//   res.status(200)
//   res.send(content)
//   res.end()
// }

function write404(res: Response) {
  res.status(404)
  res.send("404 Not Found")
  res.end()
}

function waitForRequestBody(req: Request): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const body: string[] = []
    req.on("data", chunk => body.push(typeof chunk === "string" ? chunk : chunk.toString()))
    req.on("error", err => {
      reject(err)
    })
    req.on("end", () => {
      resolve(body.join(""))
    })
  })
}

// async function configureGetRouteToFile(router: Router, relUrl: string, filePath: string) {
//   const content = await readFile(filePath, "utf8")
//   router.get(relUrl, async (req, res) => {
//     writeResponse(res, content, "text/javascript")
//   })
// }
