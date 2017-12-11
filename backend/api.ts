import { Cargo, BatchCargo } from "../isomorphic/Cargo"
import { WhoUseItem } from "../isomorphic/transfers"
import { fetchContributorsByIds, fetchContributors, createContributor, updateContributor, reorderAffectedContributors, deleteContributor, whoUseContributor } from "./dbqueries/queryContributor"
import { fetchProjects, createProject, fetchProjectsByIds, updateProject, deleteProject, whoUseProject } from "./dbqueries/queryProject"
import { createTask, updateTask, fetchTasksByIds, reorderChildTasks, deleteTask, fetchTasks, whoUseTask } from "./dbqueries/queryTask"
import { createStep, fetchStepsByIds, fetchSteps, updateStep, reorderSteps, deleteStep, whoUseStep } from "./dbqueries/queryStep"
import "./backendMeta/initBackendMeta"
import { fetchFlagsByIds, fetchFlags, createFlag, updateFlag, deleteFlag, reorderFlags, whoUseFlag } from "./dbqueries/queryFlag"
import { fetchComments, createComment, updateComment, deleteComment, fetchCommentsByIds } from "./dbqueries/queryComment"
import { fetchTaskLogEntries, fetchTaskLogEntriesByIds } from "./dbqueries/queryTaskLogEntry"
import { BackendContext, SessionData, CargoLoader } from "./backendContext/context"
import { Request, Response } from "express"
import { fetchFileById } from "./uploadEngine"

export async function routeFetch(data, sessionData?: SessionData): Promise<Cargo> {
  if (!sessionData)
    throw new Error("Required sessionData missing in route callback")

  let context = {
    sessionData,
    loader: new CargoLoader()
  }
  await executeFetch(context, data)
  return context.loader.toCargo()
}

export async function routeExec(data, sessionData?: SessionData): Promise<Cargo> {
  if (!sessionData)
    throw new Error("Required sessionData missing in route callback")

  let context = {
    sessionData,
    loader: new CargoLoader()
  }
  await executeCommand(context, data)
  return context.loader.toCargo()
}

export async function routeBatch(list: any[], sessionData?: SessionData): Promise<BatchCargo> {
  if (!sessionData)
    throw new Error("Required sessionData missing in route callback")

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

const whoUseCallbacks = {
  Contributor: whoUseContributor,
  Flag: whoUseFlag,
  Project: whoUseProject,
  Task: whoUseTask,
  Step: whoUseStep
}

export async function routeWhoUse(data, sessionData?: SessionData): Promise<object> {
  if (!sessionData)
    throw new Error("Required sessionData missing in route callback")

  let cb = whoUseCallbacks[data.type]
  if (!cb)
    throw new Error(`Invalid 'whoUser' type: "${data.type}"`)
  let result: WhoUseItem[] | null = await cb(data.id)
  return {
    done: true,
    result
  }
}

export async function routeGetFile(data: any, sessionData?: SessionData, req?: Request, res?: Response) {
  if (!sessionData || !req || ! res)
    throw new Error("Required parameter missing in route callback")
  if (!req.params.fileId)
    throw new Error("Missing file ID in request")

  let f = await fetchFileById(req.params.fileId)

  if (f) {
    let info = f.info

    if (info.mimeType)
      res.type(info.mimeType)
    if (info.weight)
      res.set("Content-Length", info.weight.toString())
    res.write(f.buffer)
  } else {
    res.status(404)
    res.send("404 Not Found")
  }
  res.end()
}

const fetchCallbacks = {
  Project: fetchProjects,
  Task: fetchTasks,
  Step: fetchSteps,
  Flag: fetchFlags,
  Contributor: fetchContributors,
  Comment: fetchComments,
  TaskLogEntry: fetchTaskLogEntries
}

async function executeFetch(context: BackendContext, data) {
  context.loader.startResponse("fragments")
  let cb = fetchCallbacks[data.type]
  if (!cb)
    throw new Error(`Invalid fetch type: "${data.type}"`)
  await cb(context, data.filters || {})
  await completeCargo(context)
}

const commands = {
  Contributor: executeCommandContributor,
  Project: executeCommandProject,
  Step: executeCommandStep,
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
  else if (data.cmd === "update")
    await updateStep(context, data.frag)
  else if (data.cmd === "delete")
    await deleteStep(context, data.frag)
  else if (data.cmd === "reorder")
    await reorderSteps(context, data.idList)
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
    await fetchFlagsByIds(context, upd.getNeededFragments("Flag") as any)
    await fetchContributorsByIds(context, upd.getNeededFragments("Contributor") as any)
    await fetchCommentsByIds(context, upd.getNeededFragments("Comment") as any)
    await fetchTaskLogEntriesByIds(context, upd.getNeededFragments("TaskLogEntry") as any)
  }
}
