import { FragmentMeta } from "./index"
import { pickFragmentMeta } from "./metaHelpers"

export interface MediaFragment {
  id: string
  ts: string
  baseName?: string
  originalName?: string
  ownerId?: string
}

const meta: FragmentMeta = {
  type: "Media",
  variant: "read",
  fields: {
    id: {
      dataType: "string",
      id: true
    },
    ts: {
      dataType: "number"
    },
    baseName: {
      dataType: "string",
      optional: true
    },
    originalName: {
      dataType: "string",
      optional: true
    },
    ownerId: {
      dataType: "string",
      optional: true
    }
  },
  orderFieldName: "ts"
}

export type FileInfoIdFragment = Pick<MediaFragment, "id">

export default {
  read: meta,
  id: pickFragmentMeta("id", meta, ["id"])
}
