import CargoLoader from "../cargoLoader/CargoLoader"
import { getDbConnection, toIntList, int } from "./dbUtils"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { toSqlValues } from "../backendMeta/backendMetaStore"
import { TaskLogEntryFragment, TaskLogEntryQuery } from "../../isomorphic/fragments/TaskLogEntry"

// --
// -- Read
// --

export async function queryTaskLogEntries(loader: CargoLoader, filters: TaskLogEntryQuery) {
  let cn = await getDbConnection()
  let sql = selectFromTaskLogEntry()
    .andWhere("l.task_id", int(filters.taskId))
    .orderBy("l.entry_ts desc")
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    loader.addFragment({
      type: "TaskLogEntry",
      frag: toTaskLogEntryFragment(row),
      asResult: "fragments"
    })
  }
}

export async function fetchTaskLogEntries(loader: CargoLoader, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = selectFromTaskLogEntry()
    .where("l.task_log_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toTaskLogEntryFragment(row)
    loader.modelUpdate.addFragment("TaskLogEntry", data.id, data)
  }
}

function selectFromTaskLogEntry() {
  return buildSelect()
    .select("l.task_log_id, l.task_id, l.step_id, l.entry_ts, l.contributor_id")
    .from("task_log l")
}

function toTaskLogEntryFragment(row): TaskLogEntryFragment {
  return {
    id: row["task_log_id"].toString(),
    taskId: row["task_id"].toString(),
    stepId: row["step_id"].toString(),
    entryTs: row["entry_ts"],
    contributorId: row["contributor_id"].toString()
  }
}

// --
// -- Create
// --

export async function logStepChange(taskId: string, stepId: string, contributorId: string) {
  let cn = await getDbConnection()

  let sql = buildInsert()
    .insertInto("task_log")
    .values({
      "task_id": int(taskId),
      "step_id": int(stepId),
      "contributorId": int(contributorId)
    })
  await cn.run(sql.toSql())
}
