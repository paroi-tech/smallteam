import { FragmentMeta, pickFragmentMeta, UpdPick, updPickFragmentMeta } from "../FragmentMeta"

export interface StepFragment {
  readonly id: string
  readonly name: string
  readonly orderNum?: number
  readonly typeId: string
  readonly projectId: string
}

export const stepMeta: FragmentMeta = {
  type: "Step",
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

export type NewStepFragment = Pick<StepFragment, "typeId" | "projectId">
export const newStepMeta = pickFragmentMeta("New", stepMeta, ["typeId", "projectId"])

export type StepIdFragment = Pick<StepFragment, "id">
export const StepIdMeta = pickFragmentMeta("Id", stepMeta, ["id"])
