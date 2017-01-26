import * as path from "path"
import * as express from "express"
import { Response } from "express"
import CargoLoader from "./CargoLoader"
import { Cargo } from "../isomorphic/Cargo"
import { meta } from "../isomorphic/meta"
import { queryProjects, createProject, fetchProjects, fetchTasks } from "./dbqueries/fetchProjects"

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
          setTimeout(() => {
            cb(resp, reqData).then(
              respData => writeServerResponse(resp, 200, respData),
              err => writeServerResponseError(resp, err)
            )
          }, 1500)
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
  await queryProjects(loader, data.filters || {})
  await completeCargo(loader)
  return loader.toCargo()
}

async function executeExec(resp: Response, data): Promise<Cargo> {
  if (data.cmd !== "create")
    throw new Error(`Invalid command: "${data.cmd}"`)
  if (data.type !== "Project")
    throw new Error(`Invalid type: "${data.type}"`)
  let loader = new CargoLoader()
  await createProject(loader, data.values)
  await completeCargo(loader)
  return loader.toCargo()
}

async function completeCargo(loader: CargoLoader) {
  let count = 0,
    types = Object.keys(meta)
  while (!loader.isComplete()) {
    if (++count > 100)
      throw new Error(`Cannot complete the cargo, infinite loop`)
    await fetchProjects(loader, loader.getNeeded("Project") as any)
    await fetchTasks(loader, loader.getNeeded("Task") as any)
  }
}
