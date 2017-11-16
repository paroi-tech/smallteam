import * as path from "path"
import * as express from "express"
import * as multer from "multer"
import { Request, Response, Router, RequestHandler } from "express"

const session = require("express-session")
const makeSQLiteExpressStore = require("connect-sqlite3")

import { routeFetch, routeExec, routeBatch, routeWhoUse } from "./api"
import { routeConnect, routeCurrentSession, routeDisconnect } from "./session"
import { routeChangePassword, routeResetPassword } from "./session"
import { routeChangeAvatar } from "./uploadEngine"
import config from "../isomorphic/config"
import { SessionData } from "./backendContext/context"
import { dbConf } from "./utils/dbUtils"

const PORT = 3921

export function startWebServer() {
  let app = express()
  let upload = multer({ dest: 'uploads/' })

  let SQLiteExpressStore = makeSQLiteExpressStore(session)
  let { dir, file } = dbConf

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

  declareSessionRoute(router, "/api/session/connect", routeConnect, true)
  declareSessionRoute(router, "/api/session/current", routeCurrentSession, true)
  declareSessionRoute(router, "/api/session/disconnect", routeDisconnect)
  declareSessionRoute(router, "/api/session/change-password", routeChangePassword)
  declareSessionRoute(router, "/reset-passwd", routeResetPassword, true)

  declareUploadRoute(router, "/api/session/change-avatar", upload.single("avatar"), routeChangeAvatar)

  // @ts-ignore
  declareRoute(router, "/api/query", routeFetch)
  // @ts-ignore
  declareRoute(router, "/api/exec", routeExec)
  // @ts-ignore
  declareRoute(router, "/api/batch", routeBatch)
  // @ts-ignore
  declareRoute(router, "/api/who-use", routeWhoUse)

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

type RouteCb = (data, sessionData?: SessionData) => Promise<any>
type SessionRouteCb = (data, req: Request, res: Response) => Promise<any>
type UploadRouteCb = (req: Request, res: Response) => Promise<any>

function declareRoute(router: Router, route: string, cb: RouteCb, isPublic = false) {
  router.post(route, function (req, res) {
    if (!isPublic && (!req.session || req.session.contributorId === undefined)) {
      console.log("404>>", req.session)
      write404(res)
      return
    }

    let body = ""

    req.on("data", function (data) {
      body += data
    })
    req.on("end", () => processRoute(req, res, body, cb, req.session as any))
  })
}

async function processRoute(req: Request, res: Response, body: string, cb: RouteCb, sessionData?: SessionData) {
  let reqData
  try {
    try {
      reqData = JSON.parse(body)
    } catch (err) {
      throw new Error(`Invalid JSON request: ${body}`)
    }
    await wait(500) // TODO: Remove this line before to release!
    let resData = await cb(reqData, sessionData)
    writeServerResponse(res, 200, resData)
  } catch (err) {
    writeServerResponseError(res, err)
  }
}

function declareSessionRoute(router: Router, route: string, cb: SessionRouteCb, isPublic = false) {
  router.post(route, function (req, res) {
    if (!isPublic && (!req.session || !req.session.contributorId)) {
      console.log("404>>", req.session)
      write404(res)
      return
    }

    let body = ""

    req.on("data", function (data) {
      body += data
    })
    req.on("end", () => processSessionRoute(req, res, body, cb))
  })
}

async function processSessionRoute(req: Request, res: Response, body: string, cb: SessionRouteCb) {
  let reqData: any

  try {
    try {
      reqData = JSON.parse(body)
    } catch (err) {
      throw new Error(`Invalid JSON request: ${body}`)
    }

    await wait(500) // TODO: Remove this line before to release!
    let resData = await cb(reqData, req, res)
    writeServerResponse(res, 200, resData)
  } catch (err) {
    writeServerResponseError(res, err)
  }
}

function declareUploadRoute(router: Router, route: string, handler:  RequestHandler, cb: UploadRouteCb) {
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
    await wait(500) // TODO: Remove this line before to release!
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
