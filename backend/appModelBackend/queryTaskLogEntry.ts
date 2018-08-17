import { ModelContext } from "./backendContext/context"
import { toIntList, int } from "../utils/dbUtils"
import { TaskLogEntryFragment, TaskLogEntrySearchFragment } from "../../isomorphic/meta/TaskLogEntry"
import { select, insert, in as sqlIn } from "sql-bricks"

// --
// -- Read
// --

export async function fetchTaskLogEntries(context: ModelContext, filters: TaskLogEntrySearchFragment) {
  let sql = selectFromTaskLogEntry()
    .where("task_id", int(filters.taskId))
    .orderBy("entry_ts")
  // Rows should be ordered by 'entry_ts' in reversed order. But SqlBricks does not support ASC and DESC
  // command on ORDER BY clause. So we reverse manually the rows.
  let rs = await context.cn.allSqlBricks(sql)
  rs.reverse()
  for (let row of rs) {
    context.loader.addFragment({
      type: "TaskLogEntry",
      frag: toTaskLogEntryFragment(row),
      asResult: "fragments"
    })
  }
}

export async function fetchTaskLogEntriesByIds(context: ModelContext, idList: string[]) {
  if (idList.length === 0)
    return
  let sql = selectFromTaskLogEntry()
    .where(sqlIn("task_log_id", toIntList(idList)))
  let rs = await context.cn.allSqlBricks(sql)
  for (let row of rs) {
    let data = toTaskLogEntryFragment(row)
    context.loader.modelUpdate.addFragment("TaskLogEntry", data.id, data)
  }
}

function selectFromTaskLogEntry() {
  return select("task_log_id, task_id, step_id, entry_ts, contributor_id").from("task_log")
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

export async function logStepChange(context: ModelContext, taskId: string, stepId: string) {
  let sql = insert("task_log", {
    "task_id": int(taskId),
    "step_id": int(stepId),
    "contributor_id": int(context.sessionData.contributorId)
  })
  await context.cn.execSqlBricks(sql)
}
