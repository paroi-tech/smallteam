import { FragmentMeta } from "./index"
import { pickFragmentMeta, PickUpdate, pickUpdateFragmentMeta, SearchPick, searchPickFragmentMeta } from "./metaHelpers"

export interface FlagFragment {
  readonly id: string
  label: string
  color: string
  orderNum?: number | null
}

const meta: FragmentMeta = {
  type: "Flag",
  variant: "read",
  fields: {
    id: {
      dataType: "string",
      id: true
    },
    label: {
      dataType: "string",
      update: true
    },
    color: {
      dataType: "string",
      update: true
    },
    orderNum: {
      dataType: "number",
      update: true,
      optional: true
    }
  },
  orderFieldName: "orderNum"
}

export type FlagCreateFragment = Pick<FlagFragment, "label" | "color" | "orderNum">
export type FlagUpdateFragment = PickUpdate<FlagFragment, "id", "label" | "color" | "orderNum">
export type FlagIdFragment = Pick<FlagFragment, "id">

export default {
  read: meta,
  create: pickFragmentMeta("create", meta, ["label", "color", "orderNum"]),
  update: pickUpdateFragmentMeta("update", meta, ["id"], ["label", "color", "orderNum"]),
  id: pickFragmentMeta("id", meta, ["id"])
}
