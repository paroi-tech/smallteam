import { FragmentMeta } from "./index"
import { pickFragmentMeta, PickUpdate, pickUpdateFragmentMeta, SearchPick, searchPickFragmentMeta } from "./metaHelpers"

export interface AttachedFile {
  readonly id: string
  name: string
  mimeType: string
  weight: number
  url: string
}

export interface TaskFragment {
  readonly id: string
  readonly projectId: string
  curStepId: string
  readonly code: string
  label: string
  description?: string | null
  createdById: string
  parentTaskId?: string // TODO: make required!
  orderNum?: number
  readonly createTs: number
  readonly updateTs: number
  affectedToIds?: string[]
  flagIds?: string[]
  readonly commentCount?: number
  attachedFiles?: AttachedFile[]
}

const meta: FragmentMeta = {
  type: "Task",
  variant: "read",
  fields: {
    id: {
      dataType: "string",
      id: true
    },
    projectId: {
      dataType: "string"
    },
    curStepId: {
      dataType: "string",
      update: true
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
      dataType: "string"
    },
    parentTaskId: {
      dataType: "string",
      update: true
    },
    orderNum: {
      dataType: "number",
      update: true
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

export type TaskCreateFragment = Pick<TaskFragment, "curStepId" | "label" | "description" | "parentTaskId" | "orderNum" | "affectedToIds" | "flagIds">
export type TaskUpdateFragment = PickUpdate<TaskFragment, "id", "curStepId" | "label" | "description" | "parentTaskId" | "orderNum" | "affectedToIds" | "flagIds">
export type TaskIdFragment = Pick<TaskFragment, "id">
export type TaskFetchFragment = SearchPick<TaskFragment, "projectId" | "curStepId" | "label" | "description" | "createdById" | "parentTaskId" | "affectedToIds" | "flagIds">

export default {
  read: meta,
  create: pickFragmentMeta("create", meta, ["curStepId", "label", "description" , "parentTaskId", "orderNum", "affectedToIds", "flagIds"]),
  update: pickUpdateFragmentMeta("update", meta, ["id"], ["curStepId", "label", "description" , "parentTaskId", "orderNum", "affectedToIds", "flagIds"]),
  id: pickFragmentMeta("id", meta, ["id"]),
  fetch: searchPickFragmentMeta("fetch", meta, ["projectId", "curStepId", "label", "description" , "createdById", "parentTaskId", "affectedToIds", "flagIds"])
}
