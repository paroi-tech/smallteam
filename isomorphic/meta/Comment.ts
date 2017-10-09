import { FragmentMeta } from "./index"
import { pickFragmentMeta, PickUpdate, pickUpdateFragmentMeta, SearchPick, searchPickFragmentMeta } from "./metaHelpers"

export interface CommentFragment {
  readonly id: string
  readonly taskId: string
  readonly writtenById: string
  body: string
  readonly createTs: number
  readonly updateTs: number
}

const meta: FragmentMeta = {
  type: "Comment",
  variant: "read",
  fields: {
    id: {
      dataType: "string",
      id: true
    },
    taskId: {
      dataType: "string"
    },
    writtenById: {
      dataType: "string"
    },
    body: {
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

export type CommentCreateFragment = Pick<CommentFragment, "taskId" | "writtenById" | "body">
export type CommentUpdateFragment = PickUpdate<CommentFragment, "id", "body">
export type CommentIdFragment = Pick<CommentFragment, "id">
export type CommentFetchFragment = Pick<CommentFragment, "taskId">

export default {
  read: meta,
  create: pickFragmentMeta("create", meta, ["taskId", "writtenById", "body"]),
  update: pickUpdateFragmentMeta("update", meta, ["id"], ["body"]),
  id: pickFragmentMeta("id", meta, ["id"]),
  fetch: pickFragmentMeta("fetch", meta, ["taskId"])
}
