import { FragmentMeta, pickFragmentMeta } from "../FragmentMeta"

export interface TaskFragment {
  readonly id: string
  code: string
  label: string
  description?: string
  createdBy: string
  affectedTo?: string
  curStepId: string
  readonly createTs: number
  readonly updateTs: number
}

export const taskMeta: FragmentMeta = {
  type: "Task",
  fields: {
    id: {
      dataType: "string",
      id: true
    },
    code: {
      dataType: "string",
      update: true
    },
    label: {
      dataType: "string",
      update: true
    },
    description: {
      dataType: "string",
      optional: true,
      update: true
    },
    createdBy: {
      dataType: "string",
      update: true
    },
    affectedTo: {
      dataType: "string",
      optional: true,
      update: true
    },
    curStepId: {
      dataType: "string",
      update: true
    },
    createTs: {
      dataType: "number"
    },
    updateTs: {
      dataType: "number"
    }
  }
}

export type NewTaskFragment = Pick<TaskFragment, "label" | "description" | "createdBy" | "curStepId">

export const newTaskMeta = pickFragmentMeta("NewTask", taskMeta, ["label", "description" , "createdBy", "curStepId"])
