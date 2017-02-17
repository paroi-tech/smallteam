import * as path from "path"
import * as express from "express"
import { Response } from "express"
import CargoLoader from "./CargoLoader"
import { Cargo } from "../isomorphic/Cargo"
import { queryProjects, createProject, fetchProjects, updateProject } from "./dbqueries/queryProject"
import { createStep, deleteStep, fetchSteps } from "./dbqueries/queryStep"
import { createTask, updateTask, fetchTasks } from "./dbqueries/queryTask"
import { createStepType, fetchStepTypes, queryStepTypes, updateStepType } from "./dbqueries/queryStepType"
import "./backendMeta/initBackendMeta"

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
          }, 500)
        }
      } catch (err) {
        writeServerResponseError(resp, err)
      }
    })
  })
}

function writeServerResponseError(resp: Response, err) {
  writeServerResponse(resp, 500, err.message)
  console.log("ERR", err, err.stack)
}

function writeServerResponse(resp: Response, httpCode, data) {
  resp.setHeader("Content-Type", "application/json")
  resp.status(httpCode)
  resp.send(JSON.stringify(data))
  resp.end()
}

async function executeQuery(resp: Response, data): Promise<Cargo> {
  let loader = new CargoLoader("fragments")
  if (data.type === "Project")
    await queryProjects(loader, data.filters || {})
  else if (data.type === "StepType")
    await queryStepTypes(loader)
  else
    throw new Error(`Invalid query type: "${data.type}"`)
  await completeCargo(loader)
  return loader.toCargo()
}

async function executeExec(resp: Response, data): Promise<Cargo> {
  let loader = new CargoLoader("fragment")
  if (data.type === "Project") {
    if (data.cmd === "create")
      await createProject(loader, data.frag)
    else if (data.cmd === "update")
      await updateProject(loader, data.frag)
    else
      throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
  } else if (data.type === "Step") {
    if (data.cmd === "create")
      await createStep(loader, data.frag)
    else if (data.cmd === "delete")
      await deleteStep(loader, data.id)
    else
      throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
  } else if (data.type === "StepType") {
    if (data.cmd === "create")
      await createStepType(loader, data.frag)
    else if (data.cmd === "update")
      await updateStepType(loader, data.frag)
    else
      throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
  } else if (data.type === "Task") {
    if (data.cmd === "create")
      await createTask(loader, data.frag)
    else if (data.cmd === "update")
      await updateTask(loader, data.frag)
    else
      throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
  } else
    throw new Error(`Invalid type: "${data.type}"`)
  await completeCargo(loader)
  return loader.toCargo()
}

async function completeCargo(loader: CargoLoader) {
  let count = 0
  while (!loader.isComplete()) {
    if (++count > 100)
      throw new Error(`Cannot complete the cargo, infinite loop`)
    await fetchProjects(loader, loader.getNeeded("Project") as any)
    await fetchTasks(loader, loader.getNeeded("Task") as any)
    await fetchSteps(loader, loader.getNeeded("Step") as any)
    await fetchStepTypes(loader, loader.getNeeded("StepType") as any)
  }
}
