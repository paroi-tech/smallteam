import { FragmentMeta, pickFragmentMeta } from "../FragmentMeta"

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

export const newCommentMeta = pickFragmentMeta("NewComment", commentMeta, ["taskId", "writtenById", "body"])
