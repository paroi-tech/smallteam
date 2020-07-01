import { FragmentMeta } from "./index"
import { pickFragmentMeta } from "./metaHelpers"

export interface GitCommitFragment {
  readonly id: string
  readonly externalId: string
  readonly message: string
  readonly authorName: string
  readonly ts: string
  readonly url: string
}

const meta: FragmentMeta = {
  type: "GitCommit",
  variant: "read",
  fields: {
    id: {
      dataType: "string",
      id: true
    },
    externalId: {
      dataType: "string"
    },
    message: {
      dataType: "string"
    },
    authorName: {
      dataType: "string"
    },
    url: {
      dataType: "string"
    },
    ts: {
      dataType: "string"
    }
  },
  orderFieldName: "orderNum"
}

export type GitCommitIdFragment = Pick<GitCommitFragment, "id">

export default {
  read: meta,
  id: pickFragmentMeta("id", meta, ["id"])
}
