import { FragmentMeta, pickFragmentMeta, UpdPick, updPickFragmentMeta } from "../FragmentMeta"

export interface FlagFragment {
  readonly id: string
  label: string
  color: string
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
    }
  }
}

export type NewFlagFragment = Pick<FlagFragment, "label" | "color">
export const newFlagMeta = pickFragmentMeta("New", flagMeta, ["label", "color"])

export type UpdFlagFragment = UpdPick<FlagFragment, "id", "label" | "color">
export const updFlagMeta = updPickFragmentMeta("Upd", flagMeta, ["id"], ["label", "color"])

export type FlagIdFragment = Pick<FlagFragment, "id">
export const FlagIdMeta = pickFragmentMeta("Id", flagMeta, ["id"])
