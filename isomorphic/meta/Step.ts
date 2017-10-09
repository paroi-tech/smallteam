import { FragmentMeta } from "./index"
import { pickFragmentMeta, PickUpdate, pickUpdateFragmentMeta, SearchPick, searchPickFragmentMeta } from "./metaHelpers"

export interface StepFragment {
  readonly id: string
  readonly name: string
  readonly orderNum?: number
  readonly typeId: string
  readonly projectId: string
}

const meta: FragmentMeta = {
  type: "Step",
  variant: "read",
  fields: {
    id: {
      dataType: "string",
      id: true
    },
    name: {
      dataType: "string"
    },
    orderNum: {
      dataType: "number",
      optional: true
    },
    typeId: {
      dataType: "string"
    },
    projectId: {
      dataType: "string"
    }
  },
  orderFieldName: "orderNum"
}

export type StepCreateFragment = Pick<StepFragment, "typeId" | "projectId">
export type StepIdFragment = Pick<StepFragment, "id">

export default {
  read: meta,
  create: pickFragmentMeta("create", meta, ["typeId", "projectId"]),
  id: pickFragmentMeta("id", meta, ["id"])
}
