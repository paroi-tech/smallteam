import { FragmentMeta } from "."
import { pickFragmentMeta, PickUpdate, pickUpdateFragmentMeta, SearchPick, searchPickFragmentMeta } from "./metaHelpers"

export interface AccountFragment {
  readonly id: string
  name: string
  login: string
  email: string
  role: string
  avatarId?: string
}

const meta: FragmentMeta = {
  type: "Account",
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

export type AccountCreateFragment = Pick<AccountFragment, "name" | "login" | "email" | "role">
export type AccountUpdateFragment = PickUpdate<AccountFragment, "id", "name" | "login" | "email" | "role">
export type AccountIdFragment = Pick<AccountFragment, "id">
export type AccountSearchFragment = SearchPick<AccountFragment, "name" | "login" | "email" | "role">

export default {
  read: meta,
  create: pickFragmentMeta("create", meta, ["name", "login", "email", "role"]),
  update: pickUpdateFragmentMeta("update", meta, ["id"], ["name", "login", "email", "role"]),
  id: pickFragmentMeta("id", meta, ["id"]),
  fetch: searchPickFragmentMeta("fetch", meta, ["name", "login", "email", "role"])
}
