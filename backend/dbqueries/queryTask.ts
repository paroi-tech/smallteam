import * as path from "path"
import * as sqlite from "sqlite"
import CargoLoader from "../CargoLoader"
import { TaskFragment, NewTaskFragment } from "../../isomorphic/fragments/Task"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList } from "./dbUtils"

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

export async function createTask(loader: CargoLoader, newFrag: NewTaskFragment) {
  // let cn = await getDbConnection()

  // // Project
  // let sql = buildInsert()
  //   .insertInto("project")
  //   .values({
  //     "code": newFrag.code,
  //     "task_seq": 0
  //   })
  // let ps = await cn.run(sql.toSql()),
  //   projectId = ps.lastID

  // // Step "Not Started"
  // sql = buildInsert()
  //   .insertInto("step")
  //   .values({
  //     "step_type_id": 0,
  //     "project_id": projectId
  //   })
  // ps = await cn.run(sql.toSql())
  // let notStartedStepId = ps.lastID

  // // Step "Finished"
  // sql = buildInsert()
  //   .insertInto("step")
  //   .values({
  //     "step_type_id": 1,
  //     "project_id": projectId
  //   })
  // await cn.run(sql.toSql())

  // // Task
  // sql = buildInsert()
  //   .insertInto("task")
  //   .values({
  //     "code": `${newFrag.code}-0`,
  //     "created_by": 0,
  //     "cur_step_id": notStartedStepId,
  //     "label": newFrag.name
  //   })
  // ps = await cn.run(sql.toSql())
  // let taskId = ps.lastID

  // // Mark as root task
  // sql = buildInsert()
  //   .insertInto("root_task")
  //   .values({
  //     "project_id": projectId,
  //     "task_id": taskId
  //   })
  // await cn.run(sql.toSql())

  // // Description
  // if (newFrag.description) {
  //   sql = buildInsert()
  //     .insertInto("task_description")
  //     .values({
  //       "task_id": taskId,
  //       "description": newFrag.description
  //     })
  //   await cn.run(sql.toSql())
  // }

  // loader.addFragment("Project", projectId.toString())
  // loader.setResultFragment("Project", projectId.toString())
}
