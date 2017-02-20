import * as path from "path"
import * as sqlite from "sqlite"
import CargoLoader from "../CargoLoader"
import { TaskFragment, NewTaskFragment, newTaskMeta, UpdTaskFragment, updTaskMeta, TaskQuery } from "../../isomorphic/fragments/Task"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList, int } from "./dbUtils"
import { makeTaskCodeFromStep } from "./queryProject"
import { toSqlValues } from "../backendMeta/backendMetaStore"

// --
// -- Read
// --

export async function queryTasks(loader: CargoLoader, filters: Partial<TaskQuery>) {
  let cn = await getDbConnection()
  let sql = selectFromTask()
  if (filters.createdById !== undefined)
    sql.andWhere("t.created_by", int(filters.createdById))
  if (filters.affectedToId !== undefined && filters.affectedToId !== null)
    sql.andWhere("t.affected_to", int(filters.affectedToId))
  if (filters.curStepId !== undefined)
    sql.andWhere("t.cur_step_id", int(filters.curStepId))
  if (filters.parentTaskId !== undefined)
    sql.andWhere("c.parent_task_id", int(filters.parentTaskId))
  if (filters.projectId !== undefined)
    sql.andWhere("s.project_id", int(filters.projectId))
  if (filters.label)
    sql.andWhere("t.label", filters.label)
  if (filters.description)
    sql.andWhere("d.description", filters.description)
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let frag = toTaskFragment(row)
    loader.addToResultFragments("Task", frag.id, frag)
  }
}

export async function fetchProjectTasks(loader: CargoLoader, projectIdList: number[]) {
  let cn = await getDbConnection()
  let sql = selectFromTask()
  sql.where("s.project_id", "in", projectIdList)
  //sql.andWhere("s.step_type_id", "<>", 2) // TODO: Better way to find the ID of type "Finished"?
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let frag = toTaskFragment(row)
    loader.updateModelAddFragment("Task", frag.id, frag)
  }
}

export async function fetchTasks(loader: CargoLoader, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = selectFromTask()
    .where("t.task_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toTaskFragment(row)
    loader.updateModelAddFragment("Task", data.id, data)
  }
}

function selectFromTask() {
  return buildSelect()
    .select("t.task_id, t.code, t.label, t.created_by, t.affected_to, t.cur_step_id, t.create_ts, t.update_ts, d.description, s.project_id, c.parent_task_id, c.order_num")
    .from("task t")
    .innerJoin("step s", "on", "t.cur_step_id = s.step_id")
    .leftJoin("task_description d", "using", "task_id")
    .leftJoin("task_child c", "using", "task_id")
}

function toTaskFragment(row): TaskFragment {
  let frag: TaskFragment = {
    id: row["task_id"].toString(),
    code: row["code"],
    label: row["label"],
    createdById: row["created_by"].toString(),
    curStepId: row["cur_step_id"].toString(),
    projectId: row["project_id"].toString(),
    createTs: row["create_ts"],
    updateTs: row["update_ts"]
  }
  if (row["parent_task_id"] !== null)
    frag.parentTaskId = row["parent_task_id"].toString()
  if (row["order_num"] !== null)
    frag.orderNum = row["order_num"]
  if (row["description"])
    frag.description = row["description"]
  if (row["affected_to"] !== null)
    frag.affectedToId = row["affected_to"].toString()
  return frag
}

// --
// -- Create
// --

export async function createTask(loader: CargoLoader, newFrag: NewTaskFragment) {
  let cn = await getDbConnection()

  if (newFrag.parentTaskId === undefined)
    throw new Error(`Cannot create a task without a parent: ${JSON.stringify(newFrag)}`)

  // Task
  let values = toSqlValues(newFrag, newTaskMeta) || {}
  values.code = await makeTaskCodeFromStep(int(newFrag.curStepId))
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

  loader.setResultFragment("Task", taskId.toString())
  loader.updateModelMarkFragmentAs("Task", taskId.toString(), "created")
}

async function getDefaultOrderNum(parentTaskId: number) {
  let cn = await getDbConnection()
  let sql = buildSelect()
    .select("max(order_num) as max")
    .from("task_child")
    .where("parent_task_id",parentTaskId )
  let rs = await cn.all(sql.toSql())
  return rs.length === 1 ? (rs[0]["max"] || 0) + 1 : 1
}

// --
// -- Update
// --

export async function updateTask(loader: CargoLoader, updFrag: UpdTaskFragment) {
  let cn = await getDbConnection()

  let values = toSqlValues(updFrag, updTaskMeta, "exceptId")
  if (values === null)
    return

  let taskId = int(updFrag.id)

  let sql = buildUpdate()
    .update("task")
    .set(values)
    .where("task_id", taskId)
  await cn.run(sql.toSql())

  if (updFrag.description !== undefined)
    updateTaskDescription(taskId, updFrag.description)

  loader.setResultFragment("Task", updFrag.id)
  loader.updateModelMarkFragmentAs("StepType", updFrag.id, "updated")
}

// --
// -- Reorder
// --

export async function reorderTasks(loader: CargoLoader, idList: string[], parentIdStr: string) {
  let cn = await getDbConnection()
  let parentId = int(parentIdStr)

  let oldNums = await loadOrderNums(parentId),
    curNum = 0
  for (let idStr of idList) {
    let id = int(idStr),
      oldNum = oldNums.get(id)
    if (oldNum !== undefined && ++curNum !== oldNum) {
      await updateOrderNum(id, curNum)
      loader.updateModelUpdateFields("Task", { id: id.toString(), "orderNum": curNum })
    }
    oldNums.delete(id)
  }
  let remaining = Array.from(oldNums.keys())
  remaining.sort((a, b) => {
    return a - b
  })
  for (let id of remaining) {
    let oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateOrderNum(id, curNum)
      loader.updateModelUpdateFields("Task", { id: id.toString(), "orderNum": curNum })
    }
  }
}

async function updateOrderNum(taskId: number, orderNum: number) {
  let cn = await getDbConnection()
  let sql = buildUpdate()
    .update("task_child")
    .set({
      "order_num": orderNum
    })
    .where("task_id", taskId)
  await cn.run(sql.toSql())
}

async function loadOrderNums(parentId: number): Promise<Map<number, number>> {
  let cn = await getDbConnection()
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
// -- Tools
// --

export async function updateTaskDescription(taskId: number, description: string | null) {
  let cn = await getDbConnection()
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
