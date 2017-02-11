import { FragmentMeta, pickFragmentMeta, UpdPick, updPickFragmentMeta, SearchPick, searchPickFragmentMeta } from "../FragmentMeta"

export interface TaskFragment {
  readonly id: string
  readonly code: string
  label: string
  description?: string | null
  createdById: string
  affectedToId?: string | null
  curStepId: string
  parentTaskId?: string
  orderNum?: number
  readonly projectId: string
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
    parentTaskId: {
      dataType: "string",
      update: true
    },
    orderNum: {
      dataType: "number",
      update: true
    },
    projectId: {
      dataType: "string"
    },
    createTs: {
      dataType: "number"
    },
    updateTs: {
      dataType: "number"
    }
  }
}

export type NewTaskFragment = Pick<TaskFragment, "label" | "description" | "createdById" | "curStepId" | "parentTaskId">
export const newTaskMeta = pickFragmentMeta("New", taskMeta, ["label", "description" , "createdById", "curStepId", "parentTaskId"])

export type UpdTaskFragment = UpdPick<TaskFragment, "id", "label" | "description" | "createdById" | "affectedToId" | "curStepId" | "parentTaskId" | "orderNum">
export const updTaskMeta = updPickFragmentMeta("Upd", taskMeta, ["id"], ["label", "description" , "createdById", "affectedToId", "curStepId", "parentTaskId", "orderNum"])

export type TaskQuery = SearchPick<TaskFragment, "label" | "description" | "createdById" | "affectedToId" | "curStepId" | "parentTaskId" | "projectId">
export const taskQueryMeta = searchPickFragmentMeta("New", taskMeta, ["label", "description" , "createdById", "affectedToId", "curStepId", "parentTaskId", "projectId"])
