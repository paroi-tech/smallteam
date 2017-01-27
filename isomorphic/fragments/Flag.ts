import { FragmentMeta, pickFragmentMeta } from "../FragmentMeta"

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

export const newFlagMeta = pickFragmentMeta("NewFlag", flagMeta, ["label", "color"])
