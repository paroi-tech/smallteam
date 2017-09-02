import { FragmentMeta } from "../FragmentMeta"

export interface TaskLogEntryFragment {
  readonly id: string
  readonly taskId: string
  readonly stepId: string
  readonly entryTs: number
  readonly byContributorId: string
}

export const taskLogEntryMeta: FragmentMeta = {
  type: "TaskLogEntry",
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
    byContributorId: {
      dataType: "string"
    }
  }
}
