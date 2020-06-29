import { BatchCargo, Cargo } from "@smallteam/shared/Cargo"
import { WhoUseItem } from "@smallteam/shared/transfers"
import { SessionData } from "../../session"
import { getCn, getMediaEngine } from "../../utils/dbUtils"
import { CargoLoader, ModelContext } from "./backendContext/context"
import "./backendMeta/initBackendMeta"
import {
  createAccount, deleteAccount, fetchAccounts, fetchAccountsByIds, reorderAffectedAccounts,
  updateAccount, whoUseAccount
} from "./queryAccount"
import { createComment, deleteComment, fetchComments, fetchCommentsByIds, updateComment } from "./queryComment"
import { createFlag, deleteFlag, fetchFlags, fetchFlagsByIds, reorderFlags, updateFlag, whoUseFlag } from "./queryFlag"
import { fetchGitCommitsByIds } from "./queryGitCommit"
import { createProject, deleteProject, fetchProjects, fetchProjectsByIds, updateProject, whoUseProject } from "./queryProject"
import { createStep, deleteStep, fetchSteps, fetchStepsByIds, reorderSteps, updateStep, whoUseStep } from "./queryStep"
import { createTask, deleteTask, fetchTasks, fetchTasksByIds, reorderChildTasks, updateTask, whoUseTask } from "./queryTask"
import { fetchTaskLogEntries, fetchTaskLogEntriesByIds } from "./queryTaskLogEntry"

export async function routeFetch(subdomain: string, data, sessionData?: SessionData): Promise<Cargo> {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeFetch'")
  const context: ModelContext = {
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
  const context: ModelContext = {
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
  const context: ModelContext = {
    subdomain,
    cn: await getCn(subdomain),
    mediaEngine: await getMediaEngine(subdomain),
    sessionData,
    loader: new CargoLoader(true)
  }
  for (const data of list) {
    const cmd = data.cmd
    if (!cmd)
      throw new Error("Missing command")
    if (cmd === "fetch")
      await executeFetch(context, data)
    else
      await executeCommand(context, data)
  }
  return context.loader.toBatchCargo()
}

const whoUseCallbacks = {
  Account: whoUseAccount,
  Flag: whoUseFlag,
  Project: whoUseProject,
  Task: whoUseTask,
  Step: whoUseStep
}

export async function routeWhoUse(subdomain: string, data, sessionData?: SessionData): Promise<object> {
  if (!sessionData)
    throw new Error("SessionData missing in 'routeWhoUse'")
  const cb = whoUseCallbacks[data.type]
  if (!cb)
    throw new Error(`Invalid 'whoUse' type: "${data.type}"`)
  const context: ModelContext = {
    subdomain,
    cn: await getCn(subdomain),
    mediaEngine: await getMediaEngine(subdomain),
    sessionData,
    loader: new CargoLoader(true)
  }
  const result: WhoUseItem[] | null = await cb(context, data.id)
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
  Account: fetchAccounts,
  Comment: fetchComments,
  TaskLogEntry: fetchTaskLogEntries
}

async function executeFetch(context: ModelContext, data) {
  context.loader.startResponse("fragments")
  const cb = fetchCallbacks[data.type]
  if (!cb)
    throw new Error(`Invalid fetch type: "${data.type}"`)
  await cb(context, data.filters || {})
  await completeCargo(context)
}

const commands = {
  Account: executeCommandAccount,
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
  const cb = commands[data.type]
  if (!cb)
    throw new Error(`Invalid type: "${data.type}"`)
  await cb(context, data)
  await completeCargo(context)
}

async function executeCommandAccount(context: ModelContext, data) {
  if (data.cmd === "create")
    await createAccount(context, data.frag) // FIXME: remove this. Invitations have replaced it.
  else if (data.cmd === "update")
    await updateAccount(context, data.frag)
  else if (data.cmd === "delete")
    await deleteAccount(context, data.frag)
  else if (data.cmd === "reorder" && data.groupName === "affectedTo")
    await reorderAffectedAccounts(context, data.idList, data.groupId)
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
  const upd = context.loader.modelUpdate
  let count = 0
  while (!upd.isFragmentsComplete()) {
    if (++count > 100)
      throw new Error(`Cannot complete the cargo, missing: ${upd.getMissingFragmentTypes().join(", ")}`)
    await fetchProjectsByIds(context, upd.getNeededFragments("Project") as any)
    await fetchTasksByIds(context, upd.getNeededFragments("Task") as any)
    await fetchStepsByIds(context, upd.getNeededFragments("Step") as any)
    await fetchFlagsByIds(context, upd.getNeededFragments("Flag") as any)
    await fetchAccountsByIds(context, upd.getNeededFragments("Account") as any)
    await fetchCommentsByIds(context, upd.getNeededFragments("Comment") as any)
    await fetchTaskLogEntriesByIds(context, upd.getNeededFragments("TaskLogEntry") as any)
    await fetchGitCommitsByIds(context, upd.getNeededFragments("GitCommit") as any)
  }
}
