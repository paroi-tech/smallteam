import { FragmentMeta, pickFragmentMeta, UpdPick, updPickFragmentMeta } from "../FragmentMeta"

export interface CommentFragment {
  readonly id: string
  readonly taskId: string
  readonly writtenById: string
  body: string
  readonly createTs: number
  readonly updateTs: number
}

export const commentMeta: FragmentMeta = {
  type: "Comment",
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

export type NewCommentFragment = Pick<CommentFragment, "taskId" | "writtenById" | "body">
export const newCommentMeta = pickFragmentMeta("New", commentMeta, ["taskId", "writtenById", "body"])

export type UpdCommentFragment = UpdPick<CommentFragment, "id", "body">
export const updCommentMeta = updPickFragmentMeta("Upd", commentMeta, ["id"], ["body"])

export type CommentIdFragment = Pick<CommentFragment, "id">
export const CommentIdMeta = pickFragmentMeta("Id", commentMeta, ["id"])
