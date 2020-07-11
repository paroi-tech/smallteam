import { SBConnection, SBMainConnection as DbCn } from "@ladc/sql-bricks-modifier"
import taskMeta, { TaskCreateFragment, TaskFragment, TaskIdFragment, TaskSearchFragment, TaskUpdateFragment } from "@local-packages/shared/dist/meta/Task"
import { WhoUseItem } from "@local-packages/shared/dist/transfers"
import sqlVanilla, { deleteFrom, in as sqlIn, insertInto, like, or, select, update } from "sql-bricks"
import { intVal, strVal, toIntList } from "../../utils/dbUtils"
import { ModelContext } from "./backendContext/context"
import { toSqlValues } from "./backendMeta/backendMetaStore"
import { deleteMedias, fetchMedias } from "./queryMedia"
import { logStepChange } from "./queryTaskLogEntry"

// --
// -- Read
// --

export async function fetchTasks(context: ModelContext, filters: TaskSearchFragment) {
  const sql = selectFromTask()

  if (filters.projectId !== undefined)
    sql.where("t.project_id", intVal(filters.projectId))
  if (filters.curStepId !== undefined)
    sql.where("t.cur_step_id", intVal(filters.curStepId))
  if (filters.createdById !== undefined)
    sql.where("t.created_by", intVal(filters.createdById))
  // if (filters.affectedToId) {
  //   sql.innerJoin("task_affected_to ac").using("task_id")
  //     .where("ac.account_id", int(filters.affectedToId))
  // }
  if (filters.parentTaskId !== undefined)
    sql.where("c.parent_task_id", intVal(filters.parentTaskId))
  if (filters.label)
    sql.where("t.label", filters.label)
  if (filters.description)
    sql.where("d.description", filters.description)

  if (filters.search) {
    sql.where(or([
      like("t.label", `%${filters.search}%`),
      like("d.description", `%${filters.search}%`)
    ]))
  }

  const rs = await context.cn.all(sql)
  await addDependenciesTo(context, rs)
  for (const row of rs) {
    const frag = await toTaskFragment(context, row)
    context.loader.addFragment({
      type: "Task",
      frag,
      asResult: "fragments"
    })
  }
}

// function taskMatchSearch(frag: TaskFragment, query: string) {
//   return (frag.description && frag.description.indexOf(query) !== -1) || (frag.label.indexOf(query) !== -1)
// }

export async function fetchProjectTasks(context: ModelContext, projectIdList: number[]) {
  const sql = selectFromTask()

  sql.where(sqlIn("t.project_id", projectIdList))

  const rs = await context.cn.all(sql)

  await addDependenciesTo(context, rs)
  for (const row of rs) {
    const frag = await toTaskFragment(context, row)
    context.loader.modelUpdate.addFragment("Task", frag.id, frag)
  }
}

export async function fetchTasksByIds(context: ModelContext, idList: string[]) {
  if (idList.length === 0)
    return

  const sql = selectFromTask()
    .where(sqlIn("t.task_id", toIntList(idList)))
  const rs = await context.cn.all(sql)

  await addDependenciesTo(context, rs)
  for (const row of rs) {
    const data = await toTaskFragment(context, row)
    context.loader.modelUpdate.addFragment("Task", data.id, data)
  }
}

function selectFromTask() {
  return select("t.task_id, t.project_id, t.cur_step_id, t.code, t.label, t.created_by, t.create_ts, t.update_ts, d.description, c.parent_task_id, c.order_num, count(m.comment_id) as comment_count")
    .from("task t")
    .leftJoin("task_description d").using("task_id")
    .leftJoin("task_child c").using("task_id")
    .leftJoin("comment m").using("task_id")
    .groupBy("t.task_id, t.project_id, t.code, t.label, t.created_by, t.cur_step_id, t.create_ts, t.update_ts, d.description, c.parent_task_id, c.order_num")
}

async function toTaskFragment(context: ModelContext, row): Promise<TaskFragment> {
  const frag: TaskFragment = {
    id: row["task_id"].toString(),
    projectId: row["project_id"].toString(),
    curStepId: row["cur_step_id"].toString(),
    code: row["code"],
    label: row["label"],
    createdById: row["created_by"].toString(),
    createTs: row["create_ts"],
    updateTs: row["update_ts"],
    commentCount: row["comment_count"] || undefined,
    gitCommitIds: row["gitCommitIds"] ? row["gitCommitIds"].map(id => id.toString()) : undefined
  }

  if (row["parent_task_id"] !== null)
    frag.parentTaskId = row["parent_task_id"].toString()
  if (row["order_num"] !== null)
    frag.orderNum = row["order_num"]
  if (row["description"])
    frag.description = row["description"]
  if (row["affectedToIds"])
    frag.affectedToIds = row["affectedToIds"].map(id => id.toString())
  if (row["flagIds"])
    frag.flagIds = row["flagIds"].map(id => id.toString())

  const mediaIdList = await fetchMedias(context, "task", frag.id)
  if (mediaIdList.length > 0)
    frag.attachedMediaIds = mediaIdList

  return frag
}

// --
// -- Who use
// --

export async function whoUseTask(context: ModelContext, id: string): Promise<WhoUseItem[]> {
  const dbId = intVal(id)
  const result: WhoUseItem[] = []

  let count = await context.cn.singleValue<number>(select("count(1)")
    .from("task_child")
    .where("parent_task_id", dbId)
  )

  if (count && count > 0)
    result.push({ type: "Task", count })

  count = await context.cn.singleValue<number>(select("count(1)").from("root_task").where("task_id", dbId))
  if (count && count > 0)
    result.push({ type: "Project", count })

  return result
}

// --
// -- Add dependencies
// --

async function addDependenciesTo(context: ModelContext, taskRows: any[]) {
  const taskIdList = taskRows.map(row => row["task_id"])
  const accountMap = await fetchAffectedToIdentifiers(context.cn, taskIdList)
  const flagMap = await fetchFlagIdentifiers(context.cn, taskIdList)
  const gitCommitMap = await fetchGitCommitIdentifiers(context, taskIdList)

  for (const row of taskRows) {
    const accountIds = accountMap.get(row["task_id"])
    if (accountIds)
      row["affectedToIds"] = accountIds

    const flagIds = flagMap.get(row["task_id"])
    if (flagIds)
      row["flagIds"] = flagIds

    const gitCommitIds = gitCommitMap.get(row["task_id"])
    if (gitCommitIds)
      row["gitCommitIds"] = gitCommitIds
  }
}

async function fetchAffectedToIdentifiers(cn: DbCn, taskIdList: number[]): Promise<Map<number, number[]>> {
  const sql = select("a.task_id, a.account_id")
    .from("task_affected_to a")
    .where(sqlIn("a.task_id", taskIdList))
    .orderBy("1, a.order_num")
  const rs = await cn.all(sql)
  const map = new Map<number, number[]>()
  let curTaskId: number | undefined
  let curAccountIds: number[]

  for (const row of rs) {
    if (row["task_id"] !== curTaskId) {
      curTaskId = row["task_id"] as number
      curAccountIds = []
      map.set(curTaskId!, curAccountIds)
    }
    curAccountIds!.push(row["account_id"] as number)
  }

  return map
}

async function fetchFlagIdentifiers(cn: DbCn, taskIdList: number[]): Promise<Map<number, number[]>> {
  const sql = select("tf.task_id, tf.flag_id")
    .from("task_flag tf")
    .innerJoin("flag f").on("tf.flag_id", "f.flag_id")
    .where(sqlIn("tf.task_id", taskIdList))
    .orderBy("1, f.order_num")
  const rs = await cn.all(sql)
  const map = new Map<number, number[]>()
  let curTaskId: number | undefined
  let curFlagIds: number[]

  for (const row of rs) {
    if (row["task_id"] !== curTaskId) {
      curTaskId = row["task_id"] as number
      curFlagIds = []
      map.set(curTaskId!, curFlagIds)
    }
    curFlagIds!.push(row["flag_id"] as number)
    // if (!map.has(row["task_id"]))
    //   map.set(row["task_id"], [])
    // map.get(row["task_id"])!.push(row["flag_id"])
  }

  return map
}

async function fetchGitCommitIdentifiers(context: ModelContext, taskIdList: number[]): Promise<Map<number, number[]>> {
  const sql = select("ct.task_id, ct.commit_id")
    .from("git_commit_task ct")
    .innerJoin("git_commit c").on("ct.commit_id", "c.commit_id")
    .where(sqlIn("ct.task_id", taskIdList))
    .orderBy("1, c.ts")
  const rs = await context.cn.all(sql)
  const map = new Map<number, number[]>()
  let curTaskId: number | undefined
  let curGitCommitIds: number[]

  for (const row of rs) {
    if (row["task_id"] !== curTaskId) {
      curTaskId = row["task_id"] as number
      curGitCommitIds = []
      map.set(curTaskId!, curGitCommitIds)
    }
    curGitCommitIds!.push(row["commit_id"] as number)

    context.loader.modelUpdate.addFragment("GitCommit", strVal(row["commit_id"]))
  }

  return map
}

// --
// -- Create
// --

export async function createTask(context: ModelContext, newFrag: TaskCreateFragment) {
  if (newFrag.parentTaskId === undefined)
    throw new Error(`Cannot create a task without a parent: ${JSON.stringify(newFrag)}`)

  // Task
  const projectId = await fetchProjectIdFromTask(context.cn, newFrag.parentTaskId)
  const values = toSqlValues(newFrag, taskMeta.create) || {}

  values["project_id"] = intVal(projectId)
  values["code"] = await findTaskCode(context.cn, projectId)
  values["created_by"] = intVal(context.sessionData.accountId)

  let sql = insertInto("task").values(values)
  const res = await context.cn.exec(sql)
  const taskId = res.getInsertedIdAsString()

  // Task as child
  const parentTaskId = intVal(newFrag.parentTaskId)
  const orderNum = newFrag.orderNum === undefined ? await getDefaultOrderNum(context.cn, parentTaskId) : newFrag.orderNum

  sql = insertInto("task_child")
    .values({
      "task_id": taskId,
      "parent_task_id": parentTaskId,
      "order_num": orderNum
    })
  await context.cn.exec(sql)

  // Description
  if (newFrag.description) {
    sql = insertInto("task_description")
      .values({
        "task_id": taskId,
        "description": newFrag.description
      })
    await context.cn.exec(sql)
  }

  if (newFrag.affectedToIds)
    await insertTaskAffectedToAccounts(context.cn, taskId, newFrag.affectedToIds)

  if (newFrag.flagIds)
    await insertTaskFlags(context.cn, taskId, newFrag.flagIds)

  context.loader.addFragment({
    type: "Task",
    id: taskId,
    asResult: "fragment",
    markAs: "created"
  })
}

async function fetchProjectIdFromTask(cn: DbCn, taskId: string): Promise<string> {
  const id = await cn.singleValue(select("project_id").from("task").where("task_id", taskId))
  return strVal(id)
}

async function getDefaultOrderNum(cn: DbCn, parentTaskId: number) {
  const sql = select("max(order_num)")
    .from("task_child")
    .where("parent_task_id", parentTaskId)
  const max = await cn.singleValue<number>(sql)
  return (max || 0) + 1
}

// --
// -- Update
// --

export async function updateTask(context: ModelContext, updFrag: TaskUpdateFragment) {
  const taskId = intVal(updFrag.id)
  const values = toSqlValues(updFrag, taskMeta.update, "exceptId")

  if (values) {
    if (await hasStepChange(context, updFrag))
      await logStepChange(context, updFrag.id, updFrag.curStepId!)

    const sql = update("task")
      .set(values)
      .where("task_id", taskId)

    await context.cn.exec(sql)
  }

  if (updFrag.description !== undefined)
    await updateTaskDescription(context.cn, taskId, updFrag.description)

  if (updFrag.affectedToIds)
    await updateTaskAffectedToAccounts(context.cn, taskId, updFrag.affectedToIds)

  if (updFrag.flagIds)
    await updateTaskFlags(context.cn, taskId, updFrag.flagIds)

  context.loader.addFragment({
    type: "Task",
    id: taskId.toString(),
    asResult: "fragment",
    markAs: "updated"
  })
}

async function hasStepChange(context: ModelContext, updFrag: TaskUpdateFragment): Promise<boolean> {
  if (updFrag.curStepId === undefined)
    return false

  const sql = select("cur_step_id").from("task").where("task_id", intVal(updFrag.id))
  const rs = await context.cn.all(sql)

  if (rs.length !== 1)
    return false

  const prevStepId = rs[0]["cur_step_id"]

  return intVal(updFrag.curStepId) !== prevStepId
}

// --
// -- Delete
// --

export async function deleteTask(context: ModelContext, frag: TaskIdFragment) {
  const sql = deleteFrom("task")
    .where("task_id", intVal(frag.id))

  await context.cn.exec(sql)

  context.loader.modelUpdate.markFragmentAs("Task", frag.id, "deleted")

  await deleteMedias(context, { type: "task", id: frag.id })
}

// --
// -- Reorder child tasks
// --

export async function reorderChildTasks(context: ModelContext, idList: string[], parentIdStr: string) {
  const parentId = intVal(parentIdStr)
  const oldNums = await loadChildOrderNums(context.cn, parentId)
  let curNum = 0

  for (const idStr of idList) {
    const id = intVal(idStr)
    const oldNum = oldNums.get(id)

    if (oldNum !== undefined && ++curNum !== oldNum) {
      await updateChildOrderNum(context.cn, id, parentId, curNum)
      context.loader.modelUpdate.addPartial("Task", { id: id.toString(), "orderNum": curNum })
    }
    oldNums.delete(id)
  }

  const remaining = Array.from(oldNums.keys())

  remaining.sort((a, b) => a - b)
  for (const id of remaining) {
    const oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateChildOrderNum(context.cn, id, parentId, curNum)
      context.loader.modelUpdate.addPartial("Task", { id: id.toString(), "orderNum": curNum })
    }
  }
  context.loader.modelUpdate.markIdsAsReordered("Task", idList)
}

async function updateChildOrderNum(cn: DbCn, taskId: number, parentId: number, orderNum: number) {
  const sql = update("task_child")
    .set({
      "order_num": orderNum
    })
    .where({
      "task_id": taskId,
      "parent_task_id": parentId
    })

  await cn.exec(sql)
}

async function loadChildOrderNums(cn: DbCn, parentId: number): Promise<Map<number, number>> {
  const sql = select("c.task_id, c.order_num")
    .from("task_child c")
    .where("c.parent_task_id", parentId)
  const rs = await cn.all(sql)
  const orderNums = new Map<number, number>()

  for (const row of rs)
    orderNums.set(row["task_id"] as number, row["order_num"] as number)

  return orderNums
}

// --
// -- Dependencies
// --

async function insertTaskAffectedToAccounts(cn: DbCn, taskId: number | string, accountIds: string[]) {
  let orderNum = 0

  for (const accountId of accountIds) {
    const sql = insertInto("task_affected_to")
      .values({
        "task_id": intVal(taskId),
        "account_id": intVal(accountId),
        "order_num": ++orderNum
      })

    await cn.exec(sql)
  }
}

async function updateTaskAffectedToAccounts(cn: DbCn, taskId: number | string, accountIds: string[]) {
  const sql = deleteFrom("task_affected_to")
    .where("task_id", intVal(taskId))

  await cn.exec(sql)
  await insertTaskAffectedToAccounts(cn, taskId, accountIds)
}

async function insertTaskFlags(cn: DbCn, taskId: number | string, flagIds: string[]) {
  for (const flagId of flagIds) {
    const sql = insertInto("task_flag")
      .values({
        "task_id": intVal(taskId),
        "flag_id": intVal(flagId)
      })

    await cn.exec(sql)
  }
}

async function updateTaskFlags(cn: DbCn, taskId: number | string, flagIds: string[]) {
  const sql = deleteFrom("task_flag")
    .where("task_id", intVal(taskId))

  await cn.exec(sql)
  await insertTaskFlags(cn, taskId, flagIds)
}

// --
// -- Tools
// --

export async function updateTaskDescription(cn: SBConnection, taskId: number, description: string | null) {
  if (description === null) {
    const sql = deleteFrom("task_description")
      .where("task_id", taskId)

    await cn.exec(sql)
  } else {
    const sql = update("task_description")
      .set({
        description
      })
      .where("task_id", taskId)
    const res = await cn.exec(sql)

    if (res.affectedRows === 0) {
      const sql = insertInto("task_description")
        .values({
          "description": description,
          "task_id": taskId
        })

      await cn.exec(sql)
    }
  }
}

async function findTaskCode(cn: DbCn, projectId: string): Promise<string> {
  // Select project code
  const code = await cn.singleValue(select("p.code").from("project p").where("project_id", projectId))

  // Update the sequence
  let res: /* sqlite.Statement */ any | undefined
  let tries = 0
  let prevSeqVal: number

  do {
    if (tries++ >= 10)
      throw new Error(`Cannot get a new sequence value for project "${projectId}, (last changes: ${res!.affectedRows})"`)

    // Select previous task_seq
    const sql = select("task_seq")
      .from("project")
      .where("project_id", projectId)
    const rs = await cn.all(sql)

    if (rs.length !== 1)
      throw new Error(`Cannot find the project "${projectId}"`)
    prevSeqVal = rs[0]["task_seq"] as number

    // Increment the task_seq
    const upd = update("project")
      .set({
        "task_seq": sqlVanilla("task_seq + 1")
      })
      .where("project_id", projectId)
      .where("task_seq", prevSeqVal)

    res = await cn.exec(upd)
  } while (res.affectedRows !== 1)

  return `${code}-${prevSeqVal + 1}`
}
