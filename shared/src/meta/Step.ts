import { FragmentMeta } from "./index"
import { pickFragmentMeta, PickUpdate, pickUpdateFragmentMeta } from "./metaHelpers"

export interface StepFragment {
  readonly id: string
  label: string
  orderNum?: number | null
}

const meta: FragmentMeta = {
  type: "Step",
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
    orderNum: {
      dataType: "number",
      update: true,
      optional: true
    }
  },
  orderFieldName: "orderNum"
}

export type StepCreateFragment = Pick<StepFragment, "label" | "orderNum">
export type StepUpdateFragment = PickUpdate<StepFragment, "id", "label" | "orderNum">
export type StepIdFragment = Pick<StepFragment, "id">

export default {
  read: meta,
  create: pickFragmentMeta("create", meta, ["label", "orderNum"]),
  update: pickUpdateFragmentMeta("update", meta, ["id"], ["label", "orderNum"]),
  id: pickFragmentMeta("id", meta, ["id"])
}
