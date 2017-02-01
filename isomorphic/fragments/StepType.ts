import { FragmentMeta, pickFragmentMeta, UpdPick, updPickFragmentMeta } from "../FragmentMeta"

export interface StepTypeFragment {
  readonly id: string
  name: string
  orderNum: number
}

export const stepTypeMeta: FragmentMeta = {
  type: "StepType",
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
  }
}

export type NewStepTypeFragment = Pick<StepTypeFragment, "name" | "orderNum">
export const newStepTypeMeta = pickFragmentMeta("New", stepTypeMeta, ["name", "orderNum"])

export type UpdStepTypeFragment = UpdPick<StepTypeFragment, "id", "name" | "orderNum">
export const updStepTypeMeta = updPickFragmentMeta("Upd", stepTypeMeta, ["id"], ["name", "orderNum"])
