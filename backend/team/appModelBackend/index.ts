import { Cargo, BatchCargo, Type } from "../../../shared/Cargo"
import { WhoUseItem } from "../../../shared/transfers"
import { fetchContributorsByIds, fetchContributors, createContributor, updateContributor, reorderAffectedContributors, deleteContributor, whoUseContributor } from "./queryContributor"
import "./backendMeta/initBackendMeta"
import { fetchProjects, createProject, fetchProjectsByIds, updateProject, deleteProject, whoUseProject } from "./queryProject"
import { createTask, updateTask, fetchTasksByIds, reorderChildTasks, deleteTask, fetchTasks, whoUseTask } from "./queryTask"
import { createStep, fetchStepsByIds, fetchSteps, updateStep, reorderSteps, deleteStep, whoUseStep } from "./queryStep"
import { fetchFlagsByIds, fetchFlags, createFlag, updateFlag, deleteFlag, reorderFlags, whoUseFlag } from "./queryFlag"
import { fetchComments, createComment, updateComment, deleteComment, fetchCommentsByIds } from "./queryComment"
import { fetchTaskLogEntries, fetchTaskLogEntriesByIds } from "./queryTaskLogEntry"
import { ModelContext, CargoLoader } from "./backendContext/context"
import { SessionData } from "../../session"
import { getCn, getMediaEngine } from "../../utils/dbUtils";

export async function routeFetch(subdomain: string, data, sessionData?: SessionData): Promise<Cargo> {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeFetch'")
  let context: ModelContext = {
    subdomain,
    cn: await getCn(subdomain),
    mediaEngine: await getMediaEngine(subdomain),
    sessionData,
    loader: new CargoLoader()
  }
  await executeFetch(context, data)
  return context.loader.toCargo()
}

export async function routeExec(subdomain: string, data, sessionData?: SessionData): Promise<Cargo> {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeExec'")
  let context: ModelContext = {
    subdomain,
    cn: await getCn(subdomain),
    mediaEngine: await getMediaEngine(subdomain),
    sessionData,
    loader: new CargoLoader()
  }
  await executeCommand(context, data)
  return context.loader.toCargo()
}

export async function routeBatch(subdomain: string, list: any[], sessionData?: SessionData): Promise<BatchCargo> {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeBatch'")
  let context: ModelContext = {
    subdomain,
    cn: await getCn(subdomain),
    mediaEngine: await getMediaEngine(subdomain),
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

export async function routeWhoUse(subdomain: string, data, sessionData?: SessionData): Promise<object> {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeWhoUse'")
  let cb = whoUseCallbacks[data.type]
  if (!cb)
    throw new Error(`Invalid 'whoUse' type: "${data.type}"`)
  let context: ModelContext = {
    subdomain,
    cn: await getCn(subdomain),
    mediaEngine: await getMediaEngine(subdomain),
    sessionData,
    loader: new CargoLoader(true)
  }
  let result: WhoUseItem[] | null = await cb(context, data.id)
  return {
    done: true,
    result
  }
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

async function executeFetch(context: ModelContext, data) {
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

async function executeCommand(context: ModelContext, data) {
  context.loader.startResponse(data.cmd === "reorder" || data.cmd === "delete" ? "none" : "fragment")
  if (data.dependencies)
    context.loader.addDependencies(data.dependencies)
  let cb = commands[data.type]
  if (!cb)
    throw new Error(`Invalid type: "${data.type}"`)
  await cb(context, data)
  await completeCargo(context)
}

async function executeCommandContributor(context: ModelContext, data) {
  if (data.cmd === "create")
    await createContributor(context, data.frag) // FIXME: remove this. Invitations have replaced it.
  else if (data.cmd === "update")
    await updateContributor(context, data.frag)
  else if (data.cmd === "delete")
    await deleteContributor(context, data.frag)
  else if (data.cmd === "reorder" && data.groupName === "affectedTo")
    await reorderAffectedContributors(context, data.idList, data.groupId)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function executeCommandProject(context: ModelContext, data) {
  if (data.cmd === "create")
    await createProject(context, data.frag)
  else if (data.cmd === "update")
    await updateProject(context, data.frag)
  else if (data.cmd === "delete")
    await deleteProject(context, data.frag)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

async function executeCommandStep(context: ModelContext, data) {
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

async function executeCommandFlag(context: ModelContext, data) {
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

async function executeCommandTask(context: ModelContext, data) {
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

async function executeCommandComment(context: ModelContext, data) {
  if (data.cmd === "create")
    await createComment(context, data.frag)
  else if (data.cmd === "update")
    await updateComment(context, data.frag)
  else if (data.cmd === "delete")
    await deleteComment(context, data.frag)
  else
    throw new Error(`Invalid ${data.type} command: "${data.cmd}"`)
}

export async function completeCargo(context: ModelContext) {
  let upd = context.loader.modelUpdate
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
