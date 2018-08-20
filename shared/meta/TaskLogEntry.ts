import { FragmentMeta } from "./index"
import { pickFragmentMeta } from "./metaHelpers"

export interface TaskLogEntryFragment {
  readonly id: string
  readonly taskId: string
  readonly stepId: string
  readonly entryTs: number
  readonly accountId: string
}

const meta: FragmentMeta = {
  type: "TaskLogEntry",
  variant: "read",
  fields: {
    id: {
      dataType: "string",
      id: true
    },
    taskId: {
      dataType: "string"
    },
    stepId: {
      dataType: "string"
    },
    entryTs: {
      dataType: "number"
    },
    accountId: {
      dataType: "string"
    }
  }
}

export type TaskLogEntryIdFragment = Pick<TaskLogEntryFragment, "id">
export type TaskLogEntrySearchFragment = Pick<TaskLogEntryFragment, "taskId">

export default {
  read: meta,
  id: pickFragmentMeta("id", meta, ["id"]),
  fetch: pickFragmentMeta("fetch", meta, ["taskId"])
}
