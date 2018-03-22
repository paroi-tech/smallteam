import { FragmentMeta } from "./index"
import { pickFragmentMeta } from "./metaHelpers"

export interface MediaVariantFragment {
  readonly id: string
  mediaId: string
  code: string
  weightB: number
  imType: string
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
    code: {
      dataType: "string"
    },
    weightB: {
      dataType: "number"
    },
    imType: {
      dataType: "string"
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
  orderFieldName: "imgWidth"
}

export type MediaVariantIdFragment = Pick<MediaVariantFragment, "id">

export default {
  read: meta,
  id: pickFragmentMeta("id", meta, ["id"])
}
