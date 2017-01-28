import { FragmentMeta, pickFragmentMeta } from "../FragmentMeta"

export interface TaskLogFragment {
  readonly id: string
  readonly taskId: string
  readonly stepId: string
  readonly startTs: number
  readonly startedBy: string
  readonly endTs?: number
  readonly endedBy: string
}

export const taskLogMeta: FragmentMeta = {
  type: "TaskLog",
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
    startTs: {
      dataType: "number"
    },
    startedBy: {
      dataType: "string"
    },
    endTs: {
      dataType: "number"
    },
    endedBy: {
      dataType: "string"
    },
  }
}