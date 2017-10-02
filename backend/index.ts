import * as path from "path"
import * as express from "express"
import { Response } from "express"
import { routeQuery, routeExec, executeBatch, routeConnect } from "./api"
import config from "../isomorphic/config"

const PORT = 3921

process.on("uncaughtException", err => {
  console.log("uncaughtException", err)
  process.exit(1)
})

process.on("unhandledRejection", err => {
  console.log("unhandledRejection", err)
  process.exit(1)
})

let app = express()
let router = express.Router()

declareRoute(router, `/api/connect`, routeConnect)
declareRoute(router, `/api/query`, routeQuery)
declareRoute(router, `/api/exec`, routeExec)
declareRoute(router, `/api/batch`, executeBatch)

router.use(express.static(path.join(__dirname, "..", "www")))

app.use(config.urlPrefix, router)

app.get('*', function(req, resp){
  resp.status(404)
  resp.send("404 Not Found")
  resp.end()
});

app.listen(PORT, function () {
  console.log(`The smallteam server is listening on port: ${PORT}, the path is: ${config.urlPrefix}...`)
})

function wait(delayMs: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, delayMs))
}

function declareRoute(router: express.Router, route: string, cb: (data) => Promise<any>) {
  router.post(route, function (req, resp) {
    var body = ""
    req.on("data", function (data) {
      body += data
    })
    req.on("end", () => processRoute(resp, body, cb))
  })
}

async function processRoute(resp: Response, body: string, cb: (data) => Promise<any>) {
  let reqData;
  try {
    try {
      reqData = JSON.parse(body)
    } catch (err) {
      throw new Error(`Invalid JSON request: ${body}`)
    }
    await wait(500) // TODO: Remove this line before to release!
    let respData = await cb(reqData)
    writeServerResponse(resp, 200, respData)
  } catch (err) {
    writeServerResponseError(resp, err)
  }
}

function writeServerResponseError(resp: Response, err: Error) {
  writeServerResponse(resp, 500, err.message)
  console.log("ERR", err, err.stack)
}

function writeServerResponse(resp: Response, httpCode: number, data) {
  resp.setHeader("Content-Type", "application/json")
  resp.status(httpCode)
  resp.send(JSON.stringify(data))
  resp.end()
}
