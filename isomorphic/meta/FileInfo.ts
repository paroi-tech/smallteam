import { FragmentMeta } from "./index"
import { pickFragmentMeta } from "./metaHelpers"

export interface FileInfoFragment {
  readonly id: string
  name: string
  mimeType: string
  weight: number
  url: string
}

const meta: FragmentMeta = {
  type: "FileInfo",
  variant: "read",
  fields: {
    id: {
      dataType: "string",
      id: true
    },
    name: {
      dataType: "string"
    },
    mimeType: {
      dataType: "string"
    },
    weight: {
      dataType: "number"
    },
    url: {
      dataType: "string"
    }
  },
  orderFieldName: "name"
}

export type FileInfoIdFragment = Pick<FileInfoFragment, "id">

export default {
  read: meta,
  id: pickFragmentMeta("id", meta, ["id"])
}
