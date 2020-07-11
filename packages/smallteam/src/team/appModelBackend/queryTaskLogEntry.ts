import { TaskLogEntryFragment, TaskLogEntrySearchFragment } from "@smallteam-local/shared/dist/meta/TaskLogEntry"
import { in as sqlIn, insert, select } from "sql-bricks"
import { intVal, toIntList } from "../../utils/dbUtils"
import { ModelContext } from "./backendContext/context"

// --
// -- Read
// --

export async function fetchTaskLogEntries(context: ModelContext, filters: TaskLogEntrySearchFragment) {
  const sql = selectFromTaskLogEntry()
    .where("task_id", intVal(filters.taskId))
    .orderBy("entry_ts")
  // Rows should be ordered by 'entry_ts' in reversed order. But SqlBricks does not support ASC and DESC
  // command on ORDER BY clause. So we reverse manually the rows.
  const rs = await context.cn.all(sql)
  rs.reverse()
  for (const row of rs) {
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
  const sql = selectFromTaskLogEntry()
    .where(sqlIn("task_log_id", toIntList(idList)))
  const rs = await context.cn.all(sql)
  for (const row of rs) {
    const data = toTaskLogEntryFragment(row)
    context.loader.modelUpdate.addFragment("TaskLogEntry", data.id, data)
  }
}

function selectFromTaskLogEntry() {
  return select("task_log_id, task_id, step_id, entry_ts, account_id").from("task_log")
}

function toTaskLogEntryFragment(row): TaskLogEntryFragment {
  return {
    id: row["task_log_id"].toString(),
    taskId: row["task_id"].toString(),
    stepId: row["step_id"].toString(),
    entryTs: row["entry_ts"],
    accountId: row["account_id"].toString()
  }
}

// --
// -- Create
// --

export async function logStepChange(context: ModelContext, taskId: string, stepId: string) {
  const sql = insert("task_log", {
    "task_id": intVal(taskId),
    "step_id": intVal(stepId),
    "account_id": intVal(context.sessionData.accountId)
  })
  await context.cn.exec(sql)
}
