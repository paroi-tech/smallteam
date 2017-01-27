import { FragmentMeta, pickFragmentMeta } from "../FragmentMeta"

export interface CommentFragment {
  readonly id: string
  readonly taskId: string
  readonly writtenBy: string
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
    writtenBy: {
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

export type NewCommentFragment = Pick<CommentFragment, "taskId" | "writtenBy" | "body">

export const newCommentMeta = pickFragmentMeta("NewComment", commentMeta, ["taskId", "writtenBy", "body"])
