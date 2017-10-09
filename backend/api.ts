import { Cargo, BatchCargo } from "../isomorphic/Cargo"
import { fetchContributors, queryContributors, createContributor, updateContributor, reorderAffectedContributors, deleteContributor } from "./dbqueries/queryContributor"
import { queryProjects, createProject, fetchProjects, updateProject, deleteProject } from "./dbqueries/queryProject"
import { createStep, deleteStep, fetchSteps } from "./dbqueries/queryStep"
import { createTask, updateTask, fetchTasks, reorderChildTasks, deleteTask } from "./dbqueries/queryTask"
import { createStepType, fetchStepTypes, queryStepTypes, updateStepType, reorderStepTypes, deleteStepType } from "./dbqueries/queryStepType"
import "./backendMeta/initBackendMeta"
import { fetchFlags, queryFlags, createFlag, updateFlag, deleteFlag, reorderFlags } from "./dbqueries/queryFlag"
import { queryComments, createComment, updateComment, deleteComment, fetchComments } from "./dbqueries/queryComment"
import { queryTaskLogEntries, fetchTaskLogEntries } from "./dbqueries/queryTaskLogEntry"
import { BackendContext, SessionData, CargoLoader } from "./backendContext/context"

export async function routeQuery(data, sessionData: SessionData): Promise<Cargo> {
  let context = {
    sessionData,
    loader: new CargoLoader()
  }
  await executeQuery(context, data)
  return context.loader.toCargo()
}

export async function routeExec(data, sessionData: SessionData): Promise<Cargo> {
  let context = {
    sessionData,
    loader: new CargoLoader()
  }
  await executeCommand(context, data)
  return context.loader.toCargo()
}

export async function executeBatch(list: any[], sessionData: SessionData): Promise<BatchCargo> {
  let context = {
    sessionData,
    loader: new CargoLoader(true)
  }
  for (let data of list) {
    let cmd = data.cmd
    if (!cmd)
      throw new Error(`Missing command`)
    if (cmd === "query")
      await executeQuery(context, data)
    else
      await executeCommand(context, data)
  }
  return context.loader.toBatchCargo()
}

const queries = {
  Project: queryProjects,
  StepType: queryStepTypes,
  Flag: queryFlags,
  Contributor: queryContributors,
  Comment: queryComments,
  TaskLogEntry: queryTaskLogEntries
}

async function executeQuery(context: BackendContext, data) {
  context.loader.startResponse("fragments")
  let cb = queries[data.type]
  if (!cb)
    throw new Error(`Invalid query type: "${data.type}"`)
  await cb(context, data.filters || {})
  await completeCargo(context)
}

const commands = {
  Contributor: executeCommandContributor,
  Project: executeCommandProject,
  Step: executeCommandStep,
  StepType: executeCommandStepType,
  Flag: executeCommandFlag,
  Task: executeCommandTask,
  Comment: executeCommandComment
}

async function executeCommand(context: BackendContext, data) {
  context.loader.startResponse(data.cmd === "reorder" || data.cmd === "delete" ? "none" : "fragment")
  if (data.dependencies)
    context.loader.addDependencies(data.dependencies)
  let cb = commands[data.type]
  if (!cb)
    throw new Error(`Invalid type: "${data.type}"`)
  await cb(context, data)
  await completeCargo(context)
}

async function executeCommandContributor(context: BackendContext, data) {
  if (data.cmd === "create")
    await createContributor(context, data.frag)
  else if (data.cmd === "update")
    await updateContributor(context, data.frag)
  else if (data.cmd === "delete")
    await deleteContributor(context, data.frag)
  else if (data.cmd === "reorder" && data.groupName === "affectedTo")
    await reorderAffectedContributors(context, data.idList, data.groupId)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function executeCommandProject(context: BackendContext, data) {
  if (data.cmd === "create")
    await createProject(context, data.frag)
  else if (data.cmd === "update")
    await updateProject(context, data.frag)
  else if (data.cmd === "delete")
    await deleteProject(context, data.frag)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function executeCommandStep(context: BackendContext, data) {
  if (data.cmd === "create")
    await createStep(context, data.frag)
  else if (data.cmd === "delete")
    await deleteStep(context, data.frag)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function executeCommandStepType(context: BackendContext, data) {
  if (data.cmd === "create")
    await createStepType(context, data.frag)
  else if (data.cmd === "update")
    await updateStepType(context, data.frag)
  else if (data.cmd === "delete")
    await deleteStepType(context, data.frag)
  else if (data.cmd === "reorder")
    await reorderStepTypes(context, data.idList)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function executeCommandFlag(context: BackendContext, data) {
  if (data.cmd === "create")
    await createFlag(context, data.frag)
  else if (data.cmd === "update")
    await updateFlag(context, data.frag)
  else if (data.cmd === "delete")
    await deleteFlag(context, data.frag)
  else if (data.cmd === "reorder")
    await reorderFlags(context, data.idList)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function executeCommandTask(context: BackendContext, data) {
  if (data.cmd === "create")
    await createTask(context, data.frag)
  else if (data.cmd === "update")
    await updateTask(context, data.frag)
  else if (data.cmd === "delete")
    await deleteTask(context, data.frag)
  else if (data.cmd === "reorder" && data.groupName === "childOf")
    await reorderChildTasks(context, data.idList, data.groupId)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function executeCommandComment(context: BackendContext, data) {
  if (data.cmd === "create")
    await createComment(context, data.frag)
  else if (data.cmd === "update")
    await updateComment(context, data.frag)
  else if (data.cmd === "delete")
    await deleteComment(context, data.frag)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function completeCargo(context: BackendContext) {
  const upd = context.loader.modelUpdate
  let count = 0
  while (!upd.isFragmentsComplete()) {
    if (++count > 100)
      throw new Error(`Cannot complete the cargo, missing: ${upd.getMissingFragmentTypes().join(", ")}`)
    await fetchProjects(context, upd.getNeededFragments("Project") as any)
    await fetchTasks(context, upd.getNeededFragments("Task") as any)
    await fetchSteps(context, upd.getNeededFragments("Step") as any)
    await fetchStepTypes(context, upd.getNeededFragments("StepType") as any)
    await fetchFlags(context, upd.getNeededFragments("Flag") as any)
    await fetchContributors(context, upd.getNeededFragments("Contributor") as any)
    await fetchComments(context, upd.getNeededFragments("Comment") as any)
    await fetchTaskLogEntries(context, upd.getNeededFragments("TaskLogEntry") as any)
  }
}
