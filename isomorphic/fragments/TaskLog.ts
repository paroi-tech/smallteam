import { FragmentMeta } from "../FragmentMeta"

export interface TaskLogFragment {
  readonly id: string
  readonly taskId: string
  readonly stepId: string
  readonly startTs: number
  readonly startedById: string
  readonly endTs?: number
  readonly endedById: string
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
    startedById: {
      dataType: "string"
    },
    endTs: {
      dataType: "number"
    },
    endedById: {
      dataType: "string"
    },
  }
}
