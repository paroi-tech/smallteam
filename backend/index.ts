import * as path from "path"
import * as express from "express"
import { Response } from "express"
import CargoLoader from "./cargoLoader/CargoLoader"
import { Cargo, BatchCargo } from "../isomorphic/Cargo"
import { queryContributors, createContributor, updateContributor } from "./dbqueries/queryContributor"
import { queryProjects, createProject, fetchProjects, updateProject, deleteProject } from "./dbqueries/queryProject"
import { createStep, deleteStep, fetchSteps } from "./dbqueries/queryStep"
import { createTask, updateTask, fetchTasks, reorderTasks, deleteTask } from "./dbqueries/queryTask"
import { createStepType, fetchStepTypes, queryStepTypes, updateStepType, reorderStepTypes } from "./dbqueries/queryStepType"
import "./backendMeta/initBackendMeta"

process.on("uncaughtException", err => {
  console.log("uncaughtException", err)
  process.exit(1)
})

process.on("unhandledRejection", err => {
  console.log("unhandledRejection", err)
  process.exit(1)
})

let app = express()
declareRoute(app, "/api/query", routeQuery)
declareRoute(app, "/api/exec", routeExec)
declareRoute(app, "/api/batch", executeBatch)

app.use(express.static(path.join(__dirname, "..", "www")))
app.listen(3000, function () {
  console.log("The smallteam server is listening on port 3000...")
})

function wait(delayMs: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, delayMs))
}

function declareRoute(app: express.Express, route: string, cb: (data) => Promise<any>) {
  app.post(route, function (req, resp) {
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
    await wait(500)
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

async function routeQuery(data): Promise<Cargo> {
  let loader = new CargoLoader()
  await executeQuery(data, loader)
  return loader.toCargo()
}

async function routeExec(data): Promise<Cargo> {
  let loader = new CargoLoader()
  await executeCommand(data, loader)
  return loader.toCargo()
}

async function executeBatch(list: any[]): Promise<BatchCargo> {
  let loader = new CargoLoader(true)
  for (let data of list) {
    let cmd = data.cmd
    if (!cmd)
      throw new Error(`Missing command`)
    if (cmd === "query")
      await executeQuery(data, loader)
    else
      await executeCommand(data, loader)
  }
  return loader.toBatchCargo()
}

const queries = {
  Project: queryProjects,
  StepType: queryStepTypes,
  Contributor: queryContributors
}

async function executeQuery(data, loader: CargoLoader) {
  loader.startResponse("fragments")
  let cb = queries[data.type]
  if (!cb)
    throw new Error(`Invalid query type: "${data.type}"`)
  await cb(loader, data.filters || {})
  await completeCargo(loader)
}

const commands = {
  Contributor: executeCommandContributor,
  Project: executeCommandProject,
  Step: executeCommandStep,
  StepType: executeCommandStepType,
  Task: executeCommandTask
}

async function executeCommand(data, loader: CargoLoader) {
  loader.startResponse(data.cmd === "reorder" || data.cmd === "delete" ? "none" : "fragment")
  let cb = commands[data.type]
  if (!cb)
    throw new Error(`Invalid type: "${data.type}"`)
  await cb(data, loader)
  await completeCargo(loader)
}

async function executeCommandContributor(data, loader: CargoLoader) {
  if (data.cmd === "create")
    await createContributor(loader, data.frag)
  else if (data.cmd === "update")
    await updateContributor(loader, data.frag)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function executeCommandProject(data, loader: CargoLoader) {
  if (data.cmd === "create")
    await createProject(loader, data.frag)
  else if (data.cmd === "update")
    await updateProject(loader, data.frag)
  else if (data.cmd === "delete")
    await deleteProject(loader, data.frag)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function executeCommandStep(data, loader: CargoLoader) {
  if (data.cmd === "create")
    await createStep(loader, data.frag)
  else if (data.cmd === "delete")
    await deleteStep(loader, data.frag)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function executeCommandStepType(data, loader: CargoLoader) {
  if (data.cmd === "create")
    await createStepType(loader, data.frag)
  else if (data.cmd === "update")
    await updateStepType(loader, data.frag)
  else if (data.cmd === "reorder")
    await reorderStepTypes(loader, data.idList)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function executeCommandTask(data, loader: CargoLoader) {
  if (data.cmd === "create")
    await createTask(loader, data.frag)
  else if (data.cmd === "update")
    await updateTask(loader, data.frag)
  else if (data.cmd == "delete")
    await deleteTask(loader, data.frag)
  else if (data.cmd === "reorder")
    await reorderTasks(loader, data.idList, data.groupId)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function completeCargo(loader: CargoLoader) {
  let count = 0
  while (!loader.modelUpdate.isFragmentsComplete()) {
    if (++count > 100)
      throw new Error(`Cannot complete the cargo, infinite loop`)
    await fetchProjects(loader, loader.modelUpdate.getNeededFragments("Project") as any)
    await fetchTasks(loader, loader.modelUpdate.getNeededFragments("Task") as any)
    await fetchSteps(loader, loader.modelUpdate.getNeededFragments("Step") as any)
    await fetchStepTypes(loader, loader.modelUpdate.getNeededFragments("StepType") as any)
  }
}
