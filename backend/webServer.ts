import * as path from "path"
import * as express from "express"
import { Request, Response, Router } from "express"
const session = require("express-session")
const makeSQLiteExpressStore = require("connect-sqlite3")
import { routeFetch, routeExec, routeBatch, routeWhoUse } from "./api"
import { routeConnect } from "./session"
import config from "../isomorphic/config"
import { SessionData } from "./backendContext/context"
import { dbConf } from "./utils/dbUtils"

const PORT = 3921

export function startWebServer() {
  let app = express()

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
  }))

  let router = Router()

  declareRoute(router, "/api/session/connect", routeConnect, true)
  // declareRoute(router, "/api/session/recover", routeConnect, true)
  // declareRoute(router, "/api/session/save-password", routeConnect, true)

  declareRoute(router, "/api/query", routeFetch)
  declareRoute(router, "/api/exec", routeExec)
  declareRoute(router, "/api/batch", routeBatch)
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

function declareRoute(router: Router, route: string, cb: RouteCb, isPublic = false) {
  router.post(route, function (req, res) {
    if (!isPublic) {
      if (!req.session || req.session.contributorId === undefined) {
        console.log("404>>", req.session)
        write404(res)
        return
      }
    }
    let sessionData: SessionData = req.session as any
    var body = ""
    req.on("data", function (data) {
      body += data
    })
    req.on("end", () => processRoute(req, res, body, cb, sessionData))
  })
}

async function processRoute(req: Request, res: Response, body: string, cb: RouteCb, sessionData?: SessionData) {
  let reqData;
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
