import { FragmentMeta, pickFragmentMeta, UpdPick, updPickFragmentMeta, SearchPick, searchPickFragmentMeta } from "../FragmentMeta"

export interface TaskFragment {
  readonly id: string
  readonly code: string
  label: string
  description?: string | null
  createdById: string
  curStepId: string
  parentTaskId?: string // TODO: make required!
  orderNum?: number
  readonly projectId: string
  readonly createTs: number
  readonly updateTs: number
  affectedToIds?: string[]
  flagIds?: string[]
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
    },
    affectedToIds: {
      dataType: "string[]",
      optional: true,
      update: true
    },
    flagIds: {
      dataType: "string[]",
      optional: true,
      update: true
    }
  },
  orderFieldName: "orderNum"
}

export type NewTaskFragment = Pick<TaskFragment, "label" | "description" | "createdById" | "curStepId" | "parentTaskId" | "orderNum">
export const newTaskMeta = pickFragmentMeta("New", taskMeta, ["label", "description" , "createdById", "curStepId", "parentTaskId", "orderNum"])

export type UpdTaskFragment = UpdPick<TaskFragment, "id", "label" | "description" | "createdById" | "curStepId" | "parentTaskId" | "orderNum" | "affectedToIds" | "flagIds">
export const updTaskMeta = updPickFragmentMeta("Upd", taskMeta, ["id"], ["label", "description" , "createdById", "curStepId", "parentTaskId", "orderNum", "affectedToIds", "flagIds"])

export type TaskIdFragment = Pick<TaskFragment, "id">
export const TaskIdMeta = pickFragmentMeta("Id", taskMeta, ["id"])

export type TaskQuery = SearchPick<TaskFragment, "label" | "description" | "createdById" | "curStepId" | "parentTaskId" | "projectId" | "affectedToIds" | "flagIds">
export const taskQueryMeta = searchPickFragmentMeta("Q", taskMeta, ["label", "description" , "createdById", "curStepId", "parentTaskId", "projectId", "affectedToIds", "flagIds"])
