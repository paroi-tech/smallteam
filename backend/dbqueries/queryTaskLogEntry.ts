import { BackendContext } from "../backendContext/context"
import { getDbConnection, toIntList, int } from "./dbUtils"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { toSqlValues } from "../backendMeta/backendMetaStore"
import { TaskLogEntryFragment, TaskLogEntryFetchFragment } from "../../isomorphic/meta/TaskLogEntry"

// --
// -- Read
// --

export async function fetchTaskLogEntries(context: BackendContext, filters: TaskLogEntryFetchFragment) {
  let cn = await getDbConnection()
  let sql = selectFromTaskLogEntry()
    .andWhere("l.task_id", int(filters.taskId))
    .orderBy("l.entry_ts desc")
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    context.loader.addFragment({
      type: "TaskLogEntry",
      frag: toTaskLogEntryFragment(row),
      asResult: "fragments"
    })
  }
}

export async function fetchTaskLogEntriesByIds(context: BackendContext, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = selectFromTaskLogEntry()
    .where("l.task_log_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toTaskLogEntryFragment(row)
    context.loader.modelUpdate.addFragment("TaskLogEntry", data.id, data)
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

export async function logStepChange(context: BackendContext, taskId: string, stepId: string) {
  let cn = await getDbConnection()

  let sql = buildInsert()
    .insertInto("task_log")
    .values({
      "task_id": int(taskId),
      "step_id": int(stepId),
      "contributor_id": int(context.sessionData.contributorId)
    })
  await cn.run(sql.toSql())
}
