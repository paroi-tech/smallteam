import { FragmentMeta } from "./index"
import { pickFragmentMeta } from "./metaHelpers"

// export interface FileInfoFragment {
//   readonly id: string
//   name: string
//   imType: string
//   weight: number
//   url: string
//   uploaderId: string
// }

export interface FileInfoFragment {
  readonly id: string
  weightB: number
  imType: string
  variantName?: string
  media: {
    id: string
    ts: string
    baseName?: string
    originalName?: string
    ownerId?: string
  }
  url: string
  imageMeta?: {
    width: number
    height: number
  }
}


const meta: FragmentMeta = { // FIXME: New data structure
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
    imType: {
      dataType: "string"
    },
    weight: {
      dataType: "number"
    },
    url: {
      dataType: "string"
    },
    uploaderId: {
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
