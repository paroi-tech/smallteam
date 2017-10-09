import { Cargo, BatchCargo } from "../isomorphic/Cargo"
import { fetchContributorsByIds, fetchContributors, createContributor, updateContributor, reorderAffectedContributors, deleteContributor } from "./dbqueries/queryContributor"
import { fetchProjects, createProject, fetchProjectsByIds, updateProject, deleteProject } from "./dbqueries/queryProject"
import { createStep, deleteStep, fetchStepsByIds } from "./dbqueries/queryStep"
import { createTask, updateTask, fetchTasksByIds, reorderChildTasks, deleteTask, fetchTasks } from "./dbqueries/queryTask"
import { createStepType, fetchStepTypesByIds, fetchStepTypes, updateStepType, reorderStepTypes, deleteStepType } from "./dbqueries/queryStepType"
import "./backendMeta/initBackendMeta"
import { fetchFlagsByIds, fetchFlags, createFlag, updateFlag, deleteFlag, reorderFlags } from "./dbqueries/queryFlag"
import { fetchComments, createComment, updateComment, deleteComment, fetchCommentsByIds } from "./dbqueries/queryComment"
import { fetchTaskLogEntries, fetchTaskLogEntriesByIds } from "./dbqueries/queryTaskLogEntry"
import { BackendContext, SessionData, CargoLoader } from "./backendContext/context"

export async function routeQuery(data, sessionData: SessionData): Promise<Cargo> {
  let context = {
    sessionData,
    loader: new CargoLoader()
  }
  await executeFetch(context, data)
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
    if (cmd === "fetch")
      await executeFetch(context, data)
    else
      await executeCommand(context, data)
  }
  return context.loader.toBatchCargo()
}

const queries = {
  Project: fetchProjects,
  Task: fetchTasks,
  StepType: fetchStepTypes,
  Flag: fetchFlags,
  Contributor: fetchContributors,
  Comment: fetchComments,
  TaskLogEntry: fetchTaskLogEntries
}

async function executeFetch(context: BackendContext, data) {
  context.loader.startResponse("fragments")
  let cb = queries[data.type]
  if (!cb)
    throw new Error(`Invalid fetch type: "${data.type}"`)
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
    await fetchProjectsByIds(context, upd.getNeededFragments("Project") as any)
    await fetchTasksByIds(context, upd.getNeededFragments("Task") as any)
    await fetchStepsByIds(context, upd.getNeededFragments("Step") as any)
    await fetchStepTypesByIds(context, upd.getNeededFragments("StepType") as any)
    await fetchFlagsByIds(context, upd.getNeededFragments("Flag") as any)
    await fetchContributorsByIds(context, upd.getNeededFragments("Contributor") as any)
    await fetchCommentsByIds(context, upd.getNeededFragments("Comment") as any)
    await fetchTaskLogEntriesByIds(context, upd.getNeededFragments("TaskLogEntry") as any)
  }
}
