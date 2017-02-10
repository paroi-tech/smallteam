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
  }
}

export type NewStepFragment = Pick<StepFragment, "typeId" | "projectId">
export const newStepMeta = pickFragmentMeta("New", stepMeta, ["typeId", "projectId"])
