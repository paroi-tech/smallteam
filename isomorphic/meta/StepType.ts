import { FragmentMeta } from "./index"
import { pickFragmentMeta, PickUpdate, pickUpdateFragmentMeta, SearchPick, searchPickFragmentMeta } from "./metaHelpers"

export interface StepTypeFragment {
  readonly id: string
  name: string
  orderNum?: number | null
}

const meta: FragmentMeta = {
  type: "StepType",
  variant: "read",
  fields: {
    id: {
      dataType: "string",
      id: true
    },
    name: {
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

export type StepTypeCreateFragment = Pick<StepTypeFragment, "name" | "orderNum">
export type StepTypeUpdateFragment = PickUpdate<StepTypeFragment, "id", "name" | "orderNum">
export type StepTypeIdFragment = Pick<StepTypeFragment, "id">

export default {
  read: meta,
  create: pickFragmentMeta("create", meta, ["name", "orderNum"]),
  update: pickUpdateFragmentMeta("update", meta, ["id"], ["name", "orderNum"]),
  id: pickFragmentMeta("id", meta, ["id"])
}
