import * as path from "path"
import * as express from "express"
import { Response } from "express"
import CargoLoader, { Cargo } from "./CargoLoader"
import { fetchProjects, createProject } from "./dbqueries/fetchProjects"

process.on("uncaughtException", err => {
  console.log(err)
  process.exit(1)
})

let app = express()
declareRoute(app, "/api/query", executeQuery)
declareRoute(app, "/api/exec", executeExec)

app.use(express.static(path.join(__dirname, "..", "www")))
app.listen(3000, function () {
  console.log("The smallteam server is listening on port 3000...")
})

function declareRoute(app: express.Express, route: string, cb: (resp: Response, data) => Promise<any>) {
  app.post(route, function (req, resp) {
    var body = ""
    req.on("data", function (data) {
      body += data
    })
    req.on("end", function () {
      let reqData;
      try {
        try {
          reqData = JSON.parse(body)
        } catch (err) {
          throw new Error(`Invalid JSON request`)
        }
        if (reqData) {
          cb(resp, reqData).then(
            respData => writeServerResponse(resp, 200, respData),
            err => writeServerResponseError(resp, err)
          )
        }
      } catch (err) {
        writeServerResponseError(resp, err)
      }
    })
  })
}

function writeServerResponseError(resp: Response, err) {
  writeServerResponse(resp, 500, err.message)
  console.log(err)
}

function writeServerResponse(resp: Response, httpCode, data) {
  resp.setHeader("Content-Type", "application/json")
  resp.status(httpCode)
  resp.send(JSON.stringify(data))
  resp.end()
}

async function executeQuery(resp: Response, data): Promise<Cargo> {
  if (data.type !== "Project")
    throw new Error(`Invalid query type: "${data.type}"`)
  let loader = new CargoLoader()
  await fetchProjects(loader, data.filters || {})
  return loader.toCargo()
}

async function executeExec(resp: Response, data): Promise<Cargo> {
  if (data.cmd !== "create")
    throw new Error(`Invalid command: "${data.cmd}"`)
  if (data.type !== "Project")
    throw new Error(`Invalid type: "${data.type}"`)
  let loader = new CargoLoader()
  await createProject(loader, data.values)
  return loader.toCargo()
}
