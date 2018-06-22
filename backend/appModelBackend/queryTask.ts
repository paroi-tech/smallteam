import { BackendContext } from "./backendContext/context"
import taskMeta from "../../isomorphic/meta/Task"
import { TaskFragment, TaskCreateFragment, TaskIdFragment, TaskUpdateFragment, TaskSearchFragment } from "../../isomorphic/meta/Task"
import { select, insertInto, update, deleteFrom, in as sqlIn, isNotNull, like, or } from "sql-bricks"
import sqlVanilla = require("sql-bricks")
import { cn, toIntList, int } from "../utils/dbUtils"
import { toSqlValues } from "./backendMeta/backendMetaStore"
import { logStepChange } from "./queryTaskLogEntry"
import { WhoUseItem } from "../../isomorphic/transfers"
import { fetchMedias, deleteMedias } from "./queryMedia"

// --
// -- Read
// --

export async function fetchTasks(context: BackendContext, filters: TaskSearchFragment) {
  let sql = selectFromTask()

  if (filters.projectId !== undefined)
    sql.where("t.project_id", int(filters.projectId))
  if (filters.curStepId !== undefined)
    sql.where("t.cur_step_id", int(filters.curStepId))
  if (filters.createdById !== undefined)
    sql.where("t.created_by", int(filters.createdById))
  // if (filters.affectedToId) {
  //   sql.innerJoin("task_affected_to ac").using("task_id")
  //     .where("ac.contributor_id", int(filters.affectedToId))
  // }
  if (filters.parentTaskId !== undefined)
    sql.where("c.parent_task_id", int(filters.parentTaskId))
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

  let rs = await cn.allSqlBricks(sql)
  await addDependenciesTo(rs)
  for (let row of rs) {
    let frag = await toTaskFragment(context, row)
    context.loader.addFragment({
      type: "Task",
      frag: frag,
      asResult: "fragments"
    })
  }
}

function taskMatchSearch(frag: TaskFragment, query: string) {
  return (frag.description && frag.description.indexOf(query) !== -1) || (frag.label.indexOf(query) !== -1)
}

export async function fetchProjectTasks(context: BackendContext, projectIdList: number[]) {
  let sql = selectFromTask()

  sql.where(sqlIn("t.project_id", projectIdList))

  let rs = await cn.allSqlBricks(sql)

  await addDependenciesTo(rs)
  for (let row of rs) {
    let frag = await toTaskFragment(context, row)
    context.loader.modelUpdate.addFragment("Task", frag.id, frag)
  }
}

export async function fetchTasksByIds(context: BackendContext, idList: string[]) {
  if (idList.length === 0)
    return

  let sql = selectFromTask()
    .where(sqlIn("t.task_id", toIntList(idList)))
  let rs = await cn.allSqlBricks(sql)

  await addDependenciesTo(rs)
  for (let row of rs) {
    let data = await toTaskFragment(context, row)
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

async function toTaskFragment(context: BackendContext, row): Promise<TaskFragment> {
  let frag: TaskFragment = {
    id: row["task_id"].toString(),
    projectId: row["project_id"].toString(),
    curStepId: row["cur_step_id"].toString(),
    code: row["code"],
    label: row["label"],
    createdById: row["created_by"].toString(),
    createTs: row["create_ts"],
    updateTs: row["update_ts"],
    commentCount: row["comment_count"] || undefined
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

  let mediaIdList = await fetchMedias(context, "task", frag.id)
  if (mediaIdList.length > 0)
    frag.attachedMediaIds = mediaIdList

  return frag
}

// --
// -- Who use
// --

export async function whoUseTask(id: string): Promise<WhoUseItem[]> {
  let dbId = int(id),
    result: WhoUseItem[] = [],
    count: number

  count = await cn.singleValueSqlBricks(select("count(1)")
    .from("task_child")
    .where("parent_task_id", dbId)
  )

  if (count > 0)
    result.push({ type: "Task", count })

  count = await cn.singleValueSqlBricks(select("count(1)").from("root_task").where("task_id", dbId))
  if (count > 0)
    result.push({ type: "Project", count })

  return result
}

// --
// -- Add dependencies
// --

async function addDependenciesTo(taskRows: any[]) {
  let taskIdList = taskRows.map(row => row["task_id"])
  let contributorMap = await fetchAffectedToIdentifiers(taskIdList)
  let flagMap = await fetchFlagIdentifiers(taskIdList)

  for (let row of taskRows) {
    let contributorIds = contributorMap.get(row["task_id"])
    if (contributorIds)
      row["affectedToIds"] = contributorIds

    let flagIds = flagMap.get(row["task_id"])
    if (flagIds)
      row["flagIds"] = flagIds
  }
}

async function fetchAffectedToIdentifiers(taskIdList: number[]): Promise<Map<number, number[]>> {
  let sql = select("a.task_id, a.contributor_id")
    .from("task_affected_to a")
    .where(sqlIn("a.task_id", taskIdList))
    .orderBy("1, a.order_num")
  let rs = await cn.allSqlBricks(sql)
  let map = new Map<number, number[]>(),
    curTaskId: number | undefined = undefined,
    curContributorIds: number[]

  for (let row of rs) {
    if (row["task_id"] !== curTaskId) {
      curTaskId = row["task_id"]
      curContributorIds = []
      map.set(curTaskId!, curContributorIds)
    }
    curContributorIds!.push(row["contributor_id"])
  }

  return map
}

async function fetchFlagIdentifiers(taskIdList: number[]): Promise<Map<number, number[]>> {
  let sql = select("tf.task_id, tf.flag_id")
    .from("task_flag tf")
    .innerJoin("flag f").on("tf.flag_id", "f.flag_id")
    .where(sqlIn("tf.task_id", taskIdList))
    .orderBy("1, f.order_num")
  let rs = await cn.allSqlBricks(sql)
  let map = new Map<number, number[]>(),
    curTaskId: number | undefined = undefined,
    curFlagIds: number[]

  for (let row of rs) {
    if (row["task_id"] !== curTaskId) {
      curTaskId = row["task_id"]
      curFlagIds = []
      map.set(curTaskId!, curFlagIds)
    }
    curFlagIds!.push(row["flag_id"])
    // if (!map.has(row["task_id"]))
    //   map.set(row["task_id"], [])
    // map.get(row["task_id"])!.push(row["flag_id"])
  }

  return map
}

// --
// -- Create
// --

export async function createTask(context: BackendContext, newFrag: TaskCreateFragment) {
  if (newFrag.parentTaskId === undefined)
    throw new Error(`Cannot create a task without a parent: ${JSON.stringify(newFrag)}`)

  // Task
  let projectId = await fetchProjectIdFromTask(newFrag.parentTaskId)
  let values = toSqlValues(newFrag, taskMeta.create) || {}

  values["project_id"] = int(projectId)
  values["code"] = await findTaskCode(projectId)
  values["created_by"] = int(context.sessionData.contributorId)

  let sql = insertInto("task").values(values)
  let res = await cn.execSqlBricks(sql),
    taskId = res.getInsertedIdString()

  // Task as child
  let parentTaskId = int(newFrag.parentTaskId),
    orderNum = newFrag.orderNum === undefined ? await getDefaultOrderNum(parentTaskId) : newFrag.orderNum

  sql = insertInto("task_child")
    .values({
      "task_id": taskId,
      "parent_task_id": parentTaskId,
      "order_num": orderNum
    })
  await cn.execSqlBricks(sql)

  // Description
  if (newFrag.description) {
    sql = insertInto("task_description")
      .values({
        "task_id": taskId,
        "description": newFrag.description
      })
    await cn.execSqlBricks(sql)
  }

  if (newFrag.affectedToIds)
    insertTaskAffectedToContributors(taskId, newFrag.affectedToIds)

  if (newFrag.flagIds)
    insertTaskFlags(taskId, newFrag.flagIds)

  context.loader.addFragment({
    type: "Task",
    id: taskId,
    asResult: "fragment",
    markAs: "created"
  })
}

async function fetchProjectIdFromTask(taskId: string): Promise<string> {
  let id = await cn.singleValueSqlBricks(select("project_id").from("task").where("task_id", taskId))

  return id.toString()
}

async function getDefaultOrderNum(parentTaskId: number) {
  let sql = select("max(order_num) as max")
    .from("task_child")
    .where("parent_task_id", parentTaskId)
  let rs = await cn.allSqlBricks(sql)

  return rs.length === 1 ? (rs[0]["max"] || 0) + 1 : 1
}

// --
// -- Update
// --

export async function updateTask(context: BackendContext, updFrag: TaskUpdateFragment) {
  let taskId = int(updFrag.id)
  let values = toSqlValues(updFrag, taskMeta.update, "exceptId")

  if (values) {
    if (await hasStepChange(context, updFrag))
      await logStepChange(context, updFrag.id, updFrag.curStepId!)

    let sql = update("task")
      .set(values)
      .where("task_id", taskId)

    await cn.execSqlBricks(sql)
  }

  if (updFrag.description !== undefined)
    await updateTaskDescription(taskId, updFrag.description)

  if (updFrag.affectedToIds)
    await updateTaskAffectedToContributors(taskId, updFrag.affectedToIds)

  if (updFrag.flagIds)
    await updateTaskFlags(taskId, updFrag.flagIds)

  context.loader.addFragment({
    type: "Task",
    id: taskId.toString(),
    asResult: "fragment",
    markAs: "updated"
  })
}

async function hasStepChange(context: BackendContext, updFrag: TaskUpdateFragment): Promise<boolean> {
  if (updFrag.curStepId === undefined)
    return false

  let sql = select("cur_step_id").from("task").where("task_id", int(updFrag.id))
  let rs = await cn.allSqlBricks(sql)

  if (rs.length !== 1)
    return false

  let prevStepId = rs[0]["cur_step_id"]

  return int(updFrag.curStepId) !== prevStepId
}

// --
// -- Delete
// --

export async function deleteTask(context: BackendContext, frag: TaskIdFragment) {
  let sql = deleteFrom("task")
    .where("task_id", int(frag.id))

  await cn.execSqlBricks(sql)

  context.loader.modelUpdate.markFragmentAs("Task", frag.id, "deleted")

  deleteMedias(context, { type: "task", id: frag.id })
}

// --
// -- Reorder child tasks
// --

export async function reorderChildTasks(context: BackendContext, idList: string[], parentIdStr: string) {
  let parentId = int(parentIdStr)
  let oldNums = await loadChildOrderNums(parentId),
      curNum = 0

  for (let idStr of idList) {
    let id = int(idStr),
        oldNum = oldNums.get(id)

    if (oldNum !== undefined && ++curNum !== oldNum) {
      await updateChildOrderNum(id, parentId, curNum)
      context.loader.modelUpdate.addPartial("Task", { id: id.toString(), "orderNum": curNum })
    }
    oldNums.delete(id)
  }

  let remaining = Array.from(oldNums.keys())

  remaining.sort((a, b) => a - b)
  for (let id of remaining) {
    let oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateChildOrderNum(id, parentId, curNum)
      context.loader.modelUpdate.addPartial("Task", { id: id.toString(), "orderNum": curNum })
    }
  }
  context.loader.modelUpdate.markIdsAsReordered("Task", idList)
}

async function updateChildOrderNum(taskId: number, parentId: number, orderNum: number) {
  let sql = update("task_child")
    .set({
      "order_num": orderNum
    })
    .where({
      "task_id": taskId,
      "parent_task_id": parentId
    })

  await cn.execSqlBricks(sql)
}

async function loadChildOrderNums(parentId: number): Promise<Map<number, number>> {
  let sql = select("c.task_id, c.order_num")
    .from("task_child c")
    .where("c.parent_task_id", parentId)
  let rs = await cn.allSqlBricks(sql),
      orderNums = new Map<number, number>()

  for (let row of rs)
    orderNums.set(row["task_id"], row["order_num"])

  return orderNums
}

// --
// -- Dependencies
// --

async function insertTaskAffectedToContributors(taskId: number | string, contributorIds: string[]) {
  let orderNum = 0

  for (let contributorId of contributorIds) {
    let sql = insertInto("task_affected_to")
      .values({
        "task_id": int(taskId),
        "contributor_id": int(contributorId),
        "order_num": ++orderNum
      })

    await cn.execSqlBricks(sql)
  }
}

async function updateTaskAffectedToContributors(taskId: number | string, contributorIds: string[]) {
  let sql = deleteFrom("task_affected_to")
    .where("task_id", int(taskId))

  await cn.execSqlBricks(sql)
  await insertTaskAffectedToContributors(taskId, contributorIds)
}

async function insertTaskFlags(taskId: number | string, flagIds: string[]) {
  for (let flagId of flagIds) {
    let sql = insertInto("task_flag")
      .values({
        "task_id": int(taskId),
        "flag_id": int(flagId)
      })

    await cn.execSqlBricks(sql)
  }
}

async function updateTaskFlags(taskId: number | string, flagIds: string[]) {
  let sql = deleteFrom("task_flag")
    .where("task_id", int(taskId))

  await cn.execSqlBricks(sql)
  await insertTaskFlags(taskId, flagIds)
}

// --
// -- Tools
// --

export async function updateTaskDescription(taskId: number, description: string | null) {
  if (description === null) {
    let sql = deleteFrom("task_description")
      .where("task_id", taskId)

    await cn.execSqlBricks(sql)
  } else {
    let sql = update("task_description")
      .set({
        description: description
      })
      .where("task_id", taskId)
    let res = await cn.execSqlBricks(sql)

    if (res.affectedRows === 0) {
      let sql = insertInto("task_description")
        .values({
          description: description,
          task_id: taskId
        })

      await cn.execSqlBricks(sql)
    }
  }
}

async function findTaskCode(projectId: string): Promise<string> {
  // Select project code
  let code = await cn.singleValueSqlBricks(select("p.code").from("project p").where("project_id", projectId))

  // Update the sequence
  let res: /* sqlite.Statement */ any | undefined,
      tries = 0,
      prevSeqVal: number

  do {
    if (tries++ >= 10)
      throw new Error(`Cannot get a new sequence value for project "${projectId}, (last changes: ${res!.affectedRows})"`)

    // Select previous task_seq
    let sql = select("task_seq")
      .from("project")
      .where("project_id", projectId)
    let rs = await cn.allSqlBricks(sql)

    if (rs.length !== 1)
      throw new Error(`Cannot find the project "${projectId}"`)
    prevSeqVal = rs[0]["task_seq"]

    // Increment the task_seq
    let upd = update("project")
      .set({
        "task_seq": sqlVanilla("task_seq + 1")
      })
      .where("project_id", projectId)
      .where("task_seq", prevSeqVal)

    res = await cn.execSqlBricks(upd)
  } while (res.affectedRows !== 1)

  return `${code}-${prevSeqVal + 1}`
}