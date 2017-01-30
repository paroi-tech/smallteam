import { FragmentMeta, pickFragmentMeta } from "../FragmentMeta"

export interface TaskFragment {
  readonly id: string
  readonly code: string
  label: string
  description?: string
  createdById: string
  affectedToId?: string
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
      dataType: "string"
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
    createdById: {
      dataType: "string",
      update: true
    },
    affectedToId: {
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

export type NewTaskFragment = Pick<TaskFragment, "label" | "description" | "createdById" | "curStepId">
export const newTaskMeta = pickFragmentMeta("New", taskMeta, ["label", "description" , "createdById", "curStepId"])
export type UpdTaskFragment = Pick<TaskFragment, "label" | "description" | "createdById" | "affectedToId" | "curStepId">
export const updTaskMeta = pickFragmentMeta("Upd", taskMeta, ["label", "description" , "createdById", "affectedToId", "curStepId"])
