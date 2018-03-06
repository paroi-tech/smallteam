import * as path from "path"
import * as sqlite from "sqlite"
import { BackendContext } from "../backendContext/context"
import taskMeta from "../../isomorphic/meta/Task"
import { TaskFragment, TaskCreateFragment, TaskIdFragment, TaskUpdateFragment, TaskSearchFragment } from "../../isomorphic/meta/Task"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../utils/sql92builder/Sql92Builder"
import { cn, toIntList, int } from "../utils/dbUtils"
import { toSqlValues } from "../backendMeta/backendMetaStore"
import { logStepChange } from "./queryTaskLogEntry"
import { WhoUseItem } from "../../isomorphic/transfers"
import { getFileInfoFragments } from "./queryFileInfo"

// --
// -- Read
// --

export async function fetchTasks(context: BackendContext, filters: TaskSearchFragment) {
  let sql = selectFromTask()

  if (filters.projectId !== undefined)
    sql.andWhere("t.project_id", int(filters.projectId))
  if (filters.curStepId !== undefined)
    sql.andWhere("t.cur_step_id", int(filters.curStepId))
  if (filters.createdById !== undefined)
    sql.andWhere("t.created_by", int(filters.createdById))
  // if (filters.affectedToId) {
  //   sql.innerJoin("task_affected_to ac", "using", "task_id")
  //     .andWhere("ac.contributor_id", int(filters.affectedToId))
  // }
  if (filters.parentTaskId !== undefined)
    sql.andWhere("c.parent_task_id", int(filters.parentTaskId))
  if (filters.label)
    sql.andWhere("t.label", filters.label)
  if (filters.description)
    sql.andWhere("d.description", filters.description)

  if (filters.search) {
    sql.orWhere("t.label", "like", `%${filters.search}%`)
    sql.orWhere("d.description", "like", `%${filters.search}%`)
  }

  let rs = await cn.all(sql.toSql())
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

  sql.where("t.project_id", "in", projectIdList)
  // sql.andWhere("s.step_id", "<>", 2) // TODO: Better way to find the ID of type "Finished"?

  let rs = await cn.all(sql.toSql())

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
    .where("t.task_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())

  await addDependenciesTo(rs)
  for (let row of rs) {
    let data = await toTaskFragment(context, row)
    context.loader.modelUpdate.addFragment("Task", data.id, data)
  }
}

function selectFromTask() {
  return buildSelect()
    .select("t.task_id, t.project_id, t.cur_step_id, t.code, t.label, t.created_by, t.create_ts, t.update_ts, d.description, c.parent_task_id, c.order_num, count(m.comment_id) as comment_count")
    .from("task t")
    .leftJoin("task_description d", "using", "task_id")
    .leftJoin("task_child c", "using", "task_id")
    .leftJoin("comment m", "using", "task_id")
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

  await addAttachedFiles(context, frag)
  return frag
}

async function addAttachedFiles(context: BackendContext, frag: TaskFragment) {
  let infos = await getFileInfoFragments("task", frag.id)

  if (infos.length === 0)
    return

  frag.attachedFileIds = infos.map(info => info.id)
  frag.attachedFileInfo = infos

  for (let info of infos) {
    context.loader.addFragment({
      type: "FileInfo",
      frag: info,
    })
  }
}

// --
// -- Who use
// --

export async function whoUseTask(id: string): Promise<WhoUseItem[]> {
  let dbId = int(id),
    result: WhoUseItem[] = [],
    count: number

  count = await cn.singleValue(buildSelect()
    .select("count(1)")
    .from("task_child")
    .where("parent_task_id", dbId)
    .toSql())

  if (count > 0)
    result.push({ type: "Task", count })

  count = await cn.singleValue(buildSelect().select("count(1)").from("root_task").where("task_id", dbId).toSql())
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
  let sql = buildSelect()
    .select("a.task_id, a.contributor_id")
    .from("task_affected_to a")
    .where("a.task_id", "in", taskIdList)
    .orderBy("1, a.order_num")
  let rs = await cn.all(sql.toSql())
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
  let sql = buildSelect()
    .select("tf.task_id, tf.flag_id")
    .from("task_flag tf")
    .innerJoin("flag f", "on", "tf.flag_id = f.flag_id")
    .where("tf.task_id", "in", taskIdList)
    .orderBy("1, f.order_num")
  let rs = await cn.all(sql.toSql())
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

  let sql = buildInsert()
    .insertInto("task")
    .values(values)
  let ps = await cn.run(sql.toSql()),
    taskId = ps.lastID

  // Task as child
  let parentTaskId = int(newFrag.parentTaskId),
    orderNum = newFrag.orderNum === undefined ? await getDefaultOrderNum(parentTaskId) : newFrag.orderNum

  sql = buildInsert()
    .insertInto("task_child")
    .values({
      "task_id": taskId,
      "parent_task_id": parentTaskId,
      "order_num": orderNum
    })
  await cn.run(sql.toSql())

  // Description
  if (newFrag.description) {
    sql = buildInsert()
      .insertInto("task_description")
      .values({
        "task_id": taskId,
        "description": newFrag.description
      })
    await cn.run(sql.toSql())
  }

  if (newFrag.affectedToIds)
    insertTaskAffectedToContributors(taskId, newFrag.affectedToIds)

  if (newFrag.flagIds)
    insertTaskFlags(taskId, newFrag.flagIds)

  context.loader.addFragment({
    type: "Task",
    id: taskId.toString(),
    asResult: "fragment",
    markAs: "created"
  })
}

async function fetchProjectIdFromTask(taskId: string): Promise<string> {
  let id = await cn.singleValue(buildSelect().select("project_id").from("task").where("task_id", taskId).toSql())

  return id.toString()
}

async function getDefaultOrderNum(parentTaskId: number) {
  let sql = buildSelect()
    .select("max(order_num) as max")
    .from("task_child")
    .where("parent_task_id", parentTaskId)
  let rs = await cn.all(sql.toSql())

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

    let sql = buildUpdate()
      .update("task")
      .set(values)
      .where("task_id", taskId)

    await cn.run(sql.toSql())
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

  let sql = buildSelect().select("cur_step_id").from("task").where("task_id", int(updFrag.id))
  let rs = await cn.all(sql.toSql())

  if (rs.length !== 1)
    return false

  let prevStepId = rs[0]["cur_step_id"]

  return int(updFrag.curStepId) !== prevStepId
}

// --
// -- Delete
// --

export async function deleteTask(context: BackendContext, frag: TaskIdFragment) {
  let sql = buildDelete()
    .deleteFrom("task")
    .where("task_id", int(frag.id))

  await cn.run(sql.toSql())

  context.loader.modelUpdate.markFragmentAs("Task", frag.id, "deleted")
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
  let sql = buildUpdate()
    .update("task_child")
    .set({
      "order_num": orderNum
    })
    .where({
      "task_id": taskId,
      "parent_task_id": parentId
    })

  await cn.run(sql.toSql())
}

async function loadChildOrderNums(parentId: number): Promise<Map<number, number>> {
  let sql = buildSelect()
    .select("c.task_id, c.order_num")
    .from("task_child c")
    .where("c.parent_task_id", parentId)
  let rs = await cn.all(sql.toSql()),
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
    let sql = buildInsert()
      .insertInto("task_affected_to")
      .values({
        "task_id": int(taskId),
        "contributor_id": int(contributorId),
        "order_num": ++orderNum
      })

    await cn.run(sql.toSql())
  }
}

async function updateTaskAffectedToContributors(taskId: number | string, contributorIds: string[]) {
  let sql = buildDelete()
    .deleteFrom("task_affected_to")
    .where("task_id", int(taskId))

  await cn.run(sql.toSql())
  await insertTaskAffectedToContributors(taskId, contributorIds)
}

async function insertTaskFlags(taskId: number | string, flagIds: string[]) {
  for (let flagId of flagIds) {
    let sql = buildInsert()
      .insertInto("task_flag")
      .values({
        "task_id": int(taskId),
        "flag_id": int(flagId)
      })

    await cn.run(sql.toSql())
  }
}

async function updateTaskFlags(taskId: number | string, flagIds: string[]) {
  let sql = buildDelete()
    .deleteFrom("task_flag")
    .where("task_id", int(taskId))

  await cn.run(sql.toSql())
  await insertTaskFlags(taskId, flagIds)
}

// --
// -- Tools
// --

export async function updateTaskDescription(taskId: number, description: string | null) {
  if (description === null) {
    let sql = buildDelete()
      .deleteFrom("task_description")
      .where("task_id", taskId)

    await cn.run(sql.toSql())
  } else {
    let sql = buildUpdate()
      .update("task_description")
      .set({
        description: description
      })
      .where("task_id", taskId)
    let st = await cn.run(sql.toSql())

    if (st.changes === 0) {
      let sql = buildInsert()
        .insertInto("task_description")
        .values({
          description: description,
          task_id: taskId
        })

      await cn.run(sql.toSql())
    }
  }
}

async function findTaskCode(projectId: string): Promise<string> {
  // Select project code
  let code = await cn.singleValue(buildSelect().select("p.code").from("project p").where("project_id", projectId).toSql())

  // Update the sequence
  let ps: /* sqlite.Statement */ any | undefined,
      tries = 0,
      prevSeqVal: number

  do {
    if (tries++ >= 10)
      throw new Error(`Cannot get a new sequence value for project "${projectId}, (last changes: ${ps!.changes})"`)

    // Select previous task_seq
    let sql = buildSelect()
      .select("task_seq")
      .from("project")
      .where("project_id", projectId)
    let rs = await cn.all(sql.toSql())

    if (rs.length !== 1)
      throw new Error(`Cannot find the project "${projectId}"`)
    prevSeqVal = rs[0]["task_seq"]

    // Increment the task_seq
    let upd = buildUpdate()
      .update("project")
      .set({
        "task_seq": { "vanilla": "task_seq + 1" }
      })
      .where("project_id", projectId)
      .andWhere("task_seq", prevSeqVal)

    ps = await cn.run(upd.toSql())
  } while (ps.changes !== 1)

  return `${code}-${prevSeqVal + 1}`
}
