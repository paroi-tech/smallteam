import CargoLoader from "./cargoLoader/CargoLoader"
import { Cargo, BatchCargo } from "../isomorphic/Cargo"
import { fetchContributors, queryContributors, createContributor, updateContributor, reorderAffectedContributors } from "./dbqueries/queryContributor"
import { queryProjects, createProject, fetchProjects, updateProject, deleteProject } from "./dbqueries/queryProject"
import { createStep, deleteStep, fetchSteps } from "./dbqueries/queryStep"
import { createTask, updateTask, fetchTasks, reorderChildTasks, deleteTask } from "./dbqueries/queryTask"
import { createStepType, fetchStepTypes, queryStepTypes, updateStepType, reorderStepTypes } from "./dbqueries/queryStepType"
import "./backendMeta/initBackendMeta"
import { fetchFlags, queryFlags, createFlag, updateFlag, deleteFlag, reorderFlags } from "./dbqueries/queryFlag"

export async function routeQuery(data): Promise<Cargo> {
  let loader = new CargoLoader()
  await executeQuery(data, loader)
  return loader.toCargo()
}

export async function routeExec(data): Promise<Cargo> {
  let loader = new CargoLoader()
  await executeCommand(data, loader)
  return loader.toCargo()
}

export async function executeBatch(list: any[]): Promise<BatchCargo> {
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
  Flag: queryFlags,
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
  Flag: executeCommandFlag,
  Task: executeCommandTask
}

async function executeCommand(data, loader: CargoLoader) {
  loader.startResponse(data.cmd === "reorder" || data.cmd === "delete" ? "none" : "fragment")
  if (data.dependencies)
    loader.addDependencies(data.dependencies)
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
  else if (data.cmd === "reorder" && data.groupName === "affectedTo")
    await reorderAffectedContributors(loader, data.idList, data.groupId)
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

async function executeCommandFlag(data, loader: CargoLoader) {
  if (data.cmd === "create")
    await createFlag(loader, data.frag)
  else if (data.cmd === "update")
    await updateFlag(loader, data.frag)
  else if (data.cmd === "delete")
    await deleteFlag(loader, data.frag)
  else if (data.cmd === "reorder")
    await reorderFlags(loader, data.idList)
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
  else if (data.cmd === "reorder" && data.groupName === "childOf")
    await reorderChildTasks(loader, data.idList, data.groupId)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function completeCargo(loader: CargoLoader) {
  let count = 0
  while (!loader.modelUpdate.isFragmentsComplete()) {
    if (++count > 100)
      throw new Error(`Cannot complete the cargo, missing: ${loader.modelUpdate.getMissingFragmentTypes().join(", ")}`)
    await fetchProjects(loader, loader.modelUpdate.getNeededFragments("Project") as any)
    await fetchTasks(loader, loader.modelUpdate.getNeededFragments("Task") as any)
    await fetchSteps(loader, loader.modelUpdate.getNeededFragments("Step") as any)
    await fetchStepTypes(loader, loader.modelUpdate.getNeededFragments("StepType") as any)
    await fetchFlags(loader, loader.modelUpdate.getNeededFragments("Flag") as any)
    await fetchContributors(loader, loader.modelUpdate.getNeededFragments("Contributor") as any)
  }
}
