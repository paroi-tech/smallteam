import { FragmentMeta } from "./index"
import { pickFragmentMeta, PickUpdate, pickUpdateFragmentMeta, SearchPick, searchPickFragmentMeta } from "./metaHelpers"

export interface ContributorFragment {
  readonly id: string
  name: string
  login: string
  email: string
  role: string
  avatarId?: string
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
    },
    role: {
      dataType: "string",
      update: true
    },
    avatarId: {
      dataType: "string"
    }
  }
}

export type ContributorCreateFragment = Pick<ContributorFragment, "name" | "login" | "email" | "role">
export type ContributorUpdateFragment = PickUpdate<ContributorFragment, "id", "name" | "login" | "email" | "role">
export type ContributorIdFragment = Pick<ContributorFragment, "id">
export type ContributorSearchFragment = SearchPick<ContributorFragment, "name" | "login" | "email" | "role">

export default {
  read: meta,
  create: pickFragmentMeta("create", meta, ["name", "login", "email", "role"]),
  update: pickUpdateFragmentMeta("update", meta, ["id"], ["name", "login", "email", "role"]),
  id: pickFragmentMeta("id", meta, ["id"]),
  fetch: searchPickFragmentMeta("fetch", meta, ["name", "login", "email", "role"])
}
