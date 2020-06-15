import { FragmentMeta } from "./index"
import { pickFragmentMeta } from "./metaHelpers"

export interface MediaFragment {
  id: string
  ts: string
  baseName?: string
  originalName?: string
  ownerId?: string
  externalType?: string
  externalId?: string
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
    },
    externalType: {
      dataType: "string",
      optional: true
    },
    externalId: {
      dataType: "string",
      optional: true
    }
  },
  orderFieldName: "ts"
}

export type MediaIdFragment = Pick<MediaFragment, "id">

export default {
  read: meta,
  id: pickFragmentMeta("id", meta, ["id"])
}
