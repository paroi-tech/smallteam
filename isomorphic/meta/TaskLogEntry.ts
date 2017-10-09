import { FragmentMeta } from "./index"

export interface TaskLogEntryFragment {
  readonly id: string
  readonly taskId: string
  readonly stepId: string
  readonly entryTs: number
  readonly contributorId: string
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
    contributorId: {
      dataType: "string"
    }
  }
}

export type TaskLogEntryFetchFragment = Pick<TaskLogEntryFragment, "taskId">

export default {
  read: meta
}
