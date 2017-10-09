import { FragmentMeta } from "./index"
import { pickFragmentMeta, PickUpdate, pickUpdateFragmentMeta, SearchPick, searchPickFragmentMeta } from "./metaHelpers"

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
  readonly commentCount?: number
}

const meta: FragmentMeta = {
  type: "Task",
  variant: "read",
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
    },
    commentCount: {
      dataType: "number",
      optional: true
    }
  },
  orderFieldName: "orderNum"
}

export type TaskCreateFragment = Pick<TaskFragment, "label" | "description" | "createdById" | "curStepId" | "parentTaskId" | "orderNum" | "affectedToIds" | "flagIds">
export type TaskUpdateFragment = PickUpdate<TaskFragment, "id", "label" | "description" | "createdById" | "curStepId" | "parentTaskId" | "orderNum" | "affectedToIds" | "flagIds">
export type TaskIdFragment = Pick<TaskFragment, "id">
export type TaskFetchFragment = SearchPick<TaskFragment, "label" | "description" | "createdById" | "curStepId" | "parentTaskId" | "projectId" | "affectedToIds" | "flagIds">

export default {
  read: meta,
  create: pickFragmentMeta("create", meta, ["label", "description" , "createdById", "curStepId", "parentTaskId", "orderNum", "affectedToIds", "flagIds"]),
  update: pickUpdateFragmentMeta("update", meta, ["id"], ["label", "description" , "createdById", "curStepId", "parentTaskId", "orderNum", "affectedToIds", "flagIds"]),
  id: pickFragmentMeta("id", meta, ["id"]),
  fetch: searchPickFragmentMeta("fetch", meta, ["label", "description" , "createdById", "curStepId", "parentTaskId", "projectId", "affectedToIds", "flagIds"])
}
