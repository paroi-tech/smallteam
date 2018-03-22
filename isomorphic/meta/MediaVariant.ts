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

export interface MediaVariantFragment {
  readonly id: string
  weightB: number
  imType: string
  variantName?: string
  url: string
  imgWidth?: number
  imgHeight?: number
  imgDpi?: number
}


const meta: FragmentMeta = {
  type: "MediaVariant",
  variant: "read",
  fields: {
    id: {
      dataType: "string",
      id: true
    },
    mediaId: {
      dataType: "string"
    },
    weightB: {
      dataType: "number"
    },
    imType: {
      dataType: "string"
    },
    variantName: {
      dataType: "string",
      optional: true
    },
    url: {
      dataType: "string"
    },
    imgWidth: {
      dataType: "number",
      optional: true
    },
    imgHeight: {
      dataType: "number",
      optional: true
    },
    imgDpi: {
      dataType: "number",
      optional: true
    }
  },
  orderFieldName: "variantName"
}

export type MediaVariantIdFragment = Pick<MediaVariantFragment, "id">

export default {
  read: meta,
  id: pickFragmentMeta("id", meta, ["id"])
}
