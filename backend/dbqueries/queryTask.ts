import * as path from "path"
import * as sqlite from "sqlite"
import CargoLoader from "../CargoLoader"
import { TaskFragment, NewTaskFragment, UpdTaskFragment, updTaskMeta } from "../../isomorphic/fragments/Task"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList, int } from "./dbUtils"
import { makeTaskCodeFromStep } from "./queryProject"

// --
// -- Select
// --

export async function fetchTasks(loader: CargoLoader, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = selectFromTask()
    .where("t.task_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toTaskFragment(row)
    loader.addFragment("Task", data.id, data)
  }
}

function selectFromTask() {
  return buildSelect()
    .select("t.task_id, t.code, t.created_by, t.affected_to, t.cur_step_id, t.label, t.create_ts, t.update_ts")
    .from("task t")
}

function toTaskFragment(row): TaskFragment {
  let frag: TaskFragment = {
    id: row["task_id"].toString(),
    code: row["code"],
    label: row["label"],
    createdById: row["created_by"].toString(),
    curStepId: row["cur_step_id"].toString(),
    createTs: row["create_ts"],
    updateTs: row["update_ts"],
  }
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

  // Task
  let sql = buildInsert()
    .insertInto("task")
    .values({
      "code": await makeTaskCodeFromStep(int(newFrag.curStepId)),
      "label": newFrag.label,
      "created_by": int(newFrag.createdById),
      "cur_step_id": int(newFrag.curStepId)
    })
  let ps = await cn.run(sql.toSql()),
    taskId = ps.lastID

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
}

// --
// -- Update
// --

export async function updateTask(loader: CargoLoader, updFrag: UpdTaskFragment) {
  let cn = await getDbConnection()

  // Task
  let sql = buildInsert()
    .insertInto("task")
    .values(toSqlValues(updFrag, updTaskMeta))

  let values = {} as any
  for (let column of Object.keys(updFrag)) {
    values[column] =
  }
    sql.values({
      "label": updFrag.label,
      "created_by": int(updFrag.createdById),
      "cur_step_id": int(updFrag.curStepId)
    })

  let ps = await cn.run(sql.toSql()),
    taskId = ps.lastID

  // Description
  if (updFrag.description) {
    sql = buildInsert()
      .insertInto("task_description")
      .values({
        "task_id": taskId,
        "description": updFrag.description
      })
    await cn.run(sql.toSql())
  }

  loader.setResultFragment("Task", taskId.toString())
}
