import { FragmentMeta, pickFragmentMeta, UpdPick, updPickFragmentMeta } from "../FragmentMeta"

export interface FlagFragment {
  readonly id: string
  label: string
  color: string
  orderNum?: number | null
}

export const flagMeta: FragmentMeta = {
  type: "Flag",
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
  }
}

export type NewFlagFragment = Pick<FlagFragment, "label" | "color" | "orderNum">
export const newFlagMeta = pickFragmentMeta("New", flagMeta, ["label", "color", "orderNum"])

export type UpdFlagFragment = UpdPick<FlagFragment, "id", "label" | "color" | "orderNum">
export const updFlagMeta = updPickFragmentMeta("Upd", flagMeta, ["id"], ["label", "color", "orderNum"])

export type FlagIdFragment = Pick<FlagFragment, "id">
export const FlagIdMeta = pickFragmentMeta("Id", flagMeta, ["id"])
