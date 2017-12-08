import { FragmentMeta } from "./index"
import { pickFragmentMeta, PickUpdate, pickUpdateFragmentMeta, SearchPick, searchPickFragmentMeta } from "./metaHelpers"

export interface ContributorFragment {
  readonly id: string
  name: string
  login: string
  email: string
  readonly avatarUrl?: string
  // readonly avatar: ImageModel
}

const meta: FragmentMeta = {
  type: "Contributor",
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
    login: {
      dataType: "string",
      update: true
    },
    email: {
      dataType: "string",
      update: true
    }
  }
}

export type ContributorCreateFragment = Pick<ContributorFragment, "name" | "login" | "email">
export type ContributorUpdateFragment = PickUpdate<ContributorFragment, "id", "name" | "login" | "email">
export type ContributorIdFragment = Pick<ContributorFragment, "id">
export type ContributorFetchFragment = SearchPick<ContributorFragment, "name" | "login" | "email">

export default {
  read: meta,
  create: pickFragmentMeta("create", meta, ["name", "login", "email"]),
  update: pickUpdateFragmentMeta("update", meta, ["id"], ["name", "login", "email"]),
  id: pickFragmentMeta("id", meta, ["id"]),
  fetch: searchPickFragmentMeta("fetch", meta, ["name", "login", "email"])
}
